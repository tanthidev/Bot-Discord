const { v4: uuidv4 } = require('uuid')
const dayjs = require('dayjs')
const SheetService = require('../../../core/sheet')
const logError = require('../utils/errorLogger')
const nowMs = () => Number(process.hrtime.bigint() / 1000000n)


module.exports = {
  name: 'on',
  description: 'Bắt đầu ca trực làm việc',
  usage: '!on',
  example: ['!on'],

async execute(message, args, client) {
  const t0 = nowMs()

  try {
    const t1 = nowMs()
    const sheet = new SheetService(client.config.sheetId, "Working Now")
    console.log('Init SheetService:', nowMs() - t1, 'ms')

    const userId = message.author.id
    const username = message.member?.displayName || message.author.username

    const t2 = nowMs()
    const workingShift = await sheet.find(row =>
      row.DiscordID === userId && row.Status === 'Working'
    )
    console.log('Find workingShift:', nowMs() - t2, 'ms')

    if (workingShift) {
      return message.reply('Bạn đang có ca chưa kết thúc. Vui lòng `!off` trước.')
    }

    const now = dayjs()

    const row = {
      ID: uuidv4(),
      DiscordID: userId,
      Name: username,
      OnTime: now.format('YYYY-MM-DD HH:mm:ss'),
      OffTime: '',
      Minutes: '',
      Date: now.format('YYYY-MM-DD'),
      Status: 'Working',
      Note: ''
    }

    const t3 = nowMs()
    await sheet.append(row)
    console.log('Append row:', nowMs() - t3, 'ms')

    const t4 = nowMs()
    await message.reply({
      embeds: [{
        color: 0x003d7a,
        title: 'BẮT ĐẦU CA LÀM VIỆC',
        description: `<@${userId}> đã **bắt đầu ca làm việc**`,
        fields: [
          {
            name: 'Thời gian bắt đầu',
            value: now.format('HH:mm:ss'),
            inline: true
          }
        ],
        footer: {
          text: 'Nhớ kết thúc ca bằng lệnh !off khi hoàn thành công việc'
        },
        timestamp: new Date()
      }]
    })
    console.log('Reply Discord:', nowMs() - t4, 'ms')

    console.log('TOTAL:', nowMs() - t0, 'ms')

  } catch (err) {
    console.error('[ON COMMAND ERROR]', err)
    logError(client, err, 'command: on')
    return message.reply('Đã xảy ra lỗi khi bắt đầu ca làm.')
  }
}
}

// Init SheetService: 0 ms
// Find workingShift: 1157 ms
// Append row: 413 ms
// Reply Discord: 940 ms
// TOTAL: 2512 ms