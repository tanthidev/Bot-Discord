const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')
const creds = require('../../../core/credentials.json')

class SheetService {
  constructor(sheetId, sheetName) {
    this.sheetId = sheetId
    this.sheetName = sheetName
  }

  async init() {
    if (this.doc) return

    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    this.doc = new GoogleSpreadsheet(this.sheetId, auth)
    await this.doc.loadInfo()

    this.sheet = this.doc.sheetsByTitle[this.sheetName]
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" không tồn tại`)
  }

  async preappend(data) {
    await this.init()

    // 1. Insert 1 row mới ngay sau header
    await this.sheet.insertDimension('ROWS', {
        startIndex: 1,
        endIndex: 2
    })

    // 2. Reload lại rows (rất quan trọng)
    const rows = await this.sheet.getRows()

    const row = rows[0] // dòng đầu tiên sau header

    if (!row) throw new Error('Cannot get prepended row')

    // 3. Set data
    Object.entries(data).forEach(([k, v]) => {
        row.set(k, v)
    })
    
    await row.save()
  }


    async append(data) {
      await this.init()
      await this.sheet.addRows([data])
    }
      

  async getAll() {
    await this.init()
    const rows = await this.sheet.getRows()
    return rows.map(r => r.toObject())
  }

  async checkAll(fromDate, toDate = null) {
    await this.init()

    const rows = await this.sheet.getRows()

    const parseDate = (str) => {
      const [d, m, y] = str.split('/').map(Number)
      return new Date(y, m - 1, d)
    }

    const from = parseDate(fromDate)
    const to = toDate ? parseDate(toDate) : from

    const result = {}

    for (const row of rows) {

      const rowDateStr = row._rawData[6]
      const status = row._rawData[7]

      if (!rowDateStr || !status) continue

      const rowDate = parseDate(rowDateStr)

      if (rowDate < from || rowDate > to) continue

      const discordId = row._rawData[1]
      const name = row._rawData[2]
      const minutes = Number(row._rawData[5] || 0)

      if (!result[discordId]) {
        result[discordId] = {
          name,
          totalShift: 0,
          totalCancel: 0,
          totalMinutes: 0
        }
      }

      if (status === 'Done') {
        result[discordId].totalShift++
        result[discordId].totalMinutes += minutes
      }

      if (status === 'Cancel') {
        result[discordId].totalCancel++
      }
    }

    return result
  }

  async checkOne(keyword, fromDate, toDate = null) {
    await this.init()

    const rows = await this.sheet.getRows()

    const parseDate = (str) => {
      const [d, m, y] = str.split('/').map(Number)
      return new Date(y, m - 1, d)
    }

    const from = parseDate(fromDate)
    const to = toDate ? parseDate(toDate) : from

    const logs = []

    let totalShift = 0
    let totalCancel = 0
    let totalMinutes = 0
    let displayName = ''

    for (const row of rows) {
      const discordId = row._rawData[1]
      const name = row._rawData[2]
      const onTime = row._rawData[3]
      const offTime = row._rawData[4]
      const minutes = Number(row._rawData[5] || 0)
      const dateStr = row._rawData[6]
      const status = row._rawData[7]

      if (!dateStr || !status) continue

      if (
        !discordId.includes(keyword) &&
        !name.toLowerCase().includes(keyword.toLowerCase())
      ) continue

      const rowDate = parseDate(dateStr)
      if (rowDate < from || rowDate > to) continue

      displayName = name

      logs.push({
        onTime,
        offTime,
        minutes,
        status,
        date: dateStr
      })

      if (status === 'Done') {
        totalShift++
        totalMinutes += minutes
      }

      if (status === 'Cancel') {
        totalCancel++
      }
    }

    return {
      displayName,
      logs,
      totalShift,
      totalCancel,
      totalMinutes
    }
  }

  async find(predicate) {
    const rows = await this.getAll()
    return rows.find(predicate)
  }

    async update(id, data) {
        await this.init()

        const rows = await this.sheet.getRows()

        const row = rows.find(r =>
            String(r.get('ID')) === String(id)
        )

        if (!row) {
            console.log('Không tìm thấy dòng để update, ID:', id)
            return false
        }

        Object.entries(data).forEach(([k, v]) => {
            row.set(k, v)
        })

        await row.save()
        return true
    }


    async getWorkingShifts() {
      await this.init()

      const rows = await this.sheet.getRows()
      return rows.filter(r => r.Status === 'Working')
    }


    async findOne(predicate) {
      await this.init()
      const rows = await this.sheet.getRows()
      return rows.find(predicate) || null
    }

    async deleteById(id) {
      await this.init()
      const rows = await this.sheet.getRows()
      const row = rows.find(r => r._rawData[0] === id)
      if (row) await row.delete()
    }
}

module.exports = SheetService