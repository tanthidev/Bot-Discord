const SheetService = require('../../../core/sheet')
const { PermissionsBitField } = require('discord.js')
const logError = require('../../../utils/errorLogger')

module.exports = {
  name: 'checkone',
  description: 'Xem chi tiết ca trực của 1 nhân viên',
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

      // Có 2 ngày → khoảng ngày
      if (args.length >= 3 && args[args.length - 2].includes('/')) {
        fromDate = args[args.length - 2]
        toDate = args[args.length - 1]
        keywordParts = args.slice(0, args.length - 2)
      }
      // Có 1 ngày
      else {
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

      let text = `**Lịch ca trực của ${data.displayName}**\n`
      text += `Kỳ: ${fromDate}${toDate ? ' → ' + toDate : ''}\n\n`

      text += '```\n'
      text += 'STT  | Ngày       | Vào   | Ra    | Tổng (phút) | Trạng thái\n'
      text += '─'.repeat(60) + '\n'

      data.logs.forEach((l, i) => {
        const date = l.date || '--/--/----'
        const on = l.onTime?.slice(11, 16) || '--:--'
        const off = l.offTime?.slice(11, 16) || '--:--'
        const status = (l.status || '').padEnd(10)

        text += `${String(i + 1).padEnd(3)}  | ${date} | ${on} | ${off} |${String(l.minutes).padEnd(13)}| ${status}\n`
      })

      text += '```\n'
      text += `**Thống kê:**\n`
      text += `• Ca hoàn tất: ${data.totalShift}\n`
      text += `• Ca hủy: ${data.totalCancel}\n`
      text += `• Tổng thời gian: ${data.totalMinutes} phút (~${(data.totalMinutes / 60).toFixed(1)}h)`

      return message.reply(text)

    } catch (err) {
      console.error('[CHECKONE ERROR]', err)

      // Gửi log về kênh riêng
      logError(client, err, 'command: checkone')

      return message.reply('Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ dev.')
    }
  }
}