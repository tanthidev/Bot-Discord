const SheetService = require('../core/sheet')
const { PermissionsBitField, EmbedBuilder } = require('discord.js')
const logError = require('../utils/errorLogger')
const splitMessage = require('../utils/splitMessage')
const sendEmbedsSafe = require('../utils/sendEmbeds')

module.exports = {
  name: 'checkone',
  description: '(Admin) Xem chi tiết ca trực của 1 nhân viên',
  usage: '!checkone <name|discordId> <dd/mm/yyyy> [dd/mm/yyyy]',
  example: [
    '!checkone Em Thi Dev Lỏ [876] 26/02/2026',
    '!checkone 569544893102424066 25/02/2026 26/02/2026'
  ],

  async execute(message, args, client) {
    try {

      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Bạn không có quyền sử dụng lệnh này.')
      }

      if (args.length < 2) {
        return message.reply('Cú pháp: `!checkone <name|discordId> <dd/mm/yyyy> [dd/mm/yyyy]`')
      }

      let fromDate, toDate = null
      let keywordParts = []

      if (args.length >= 3 && args[args.length - 2].includes('/')) {
        fromDate = args[args.length - 2]
        toDate = args[args.length - 1]
        keywordParts = args.slice(0, args.length - 2)
      } else {
        fromDate = args[args.length - 1]
        keywordParts = args.slice(0, args.length - 1)
      }

      const keyword = keywordParts.join(' ')

      if (!keyword || !fromDate) {
        return message.reply('Sai cú pháp.')
      }

      const sheet = new SheetService(client.config.sheetId, "Attendance Mechanic")
      const data = await sheet.checkOne(keyword, fromDate, toDate)

      if (!data?.logs?.length) {
        return message.reply('Không tìm thấy dữ liệu phù hợp.')
      }

      const embeds = []

      // ===== HEADER =====

      const header = new EmbedBuilder()
        .setColor(15738)
        .setTitle(`LỊCH CA TRỰC — ${data.displayName}`)
        .setDescription(`**Ngày:** ${fromDate}${toDate ? ` → ${toDate}` : ''}`)
        .addFields(
          { name: 'Ca hoàn tất', value: String(data.totalShift), inline: true },
          { name: 'Ca huỷ', value: String(data.totalCancel), inline: true },
          { name: 'Tổng thời gian', value: `${data.totalMinutes} phút (~${(data.totalMinutes / 60).toFixed(1)}h)`, inline: true }
        )
        .setFooter({ text: 'Sky-bot Attendance System' })
        .setTimestamp()

      embeds.push(header)

      // ===== TABLE =====

      let table = ''
      table += '```\n'
      table += 'STT | Ngày       | Vào   | Ra    | Phút  | Trạng thái\n'
      table += '----------------------------------------------------\n'

      data.logs.forEach((l, i) => {
        const date = l.date || '--/--/----'
        const on = l.onTime?.slice(11, 16) || '--:--'
        const off = l.offTime?.slice(11, 16) || '--:--'
        const status = (l.status || '').padEnd(10)

        table += `${String(i + 1).padEnd(3)} | ${date} | ${on} | ${off} | ${String(l.minutes).padEnd(5)} | ${status}\n`
      })

      table += '```'

      // ===== SPLIT =====

      const chunks = splitMessage(table, 3800)

      chunks.forEach((chunk, index) => {
        const e = new EmbedBuilder()
          .setColor('#1f2937')
          .setDescription(chunk)
          .setFooter({ text: `Trang ${index + 1}/${chunks.length}` })

        embeds.push(e)
      })

      await sendEmbedsSafe(message, embeds, true)

    } catch (err) {
      console.error('[CHECKONE ERROR]', err)
      logError(client, err, 'command: checkone')
      return message.reply('Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ dev.')
    }
  }
}