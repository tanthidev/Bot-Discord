const SheetService = require('../core/sheet')
const { EmbedBuilder, PermissionsBitField } = require('discord.js')
const logError = require('../utils/errorLogger')
const splitMessage = require('../utils/splitMessage')
const sendEmbedsSafe = require('../utils/sendEmbeds')

module.exports = {
  name: 'checkall',
  description: '(Admin)Thống kê toàn bộ ca trực của nhân viên theo ngày hoặc khoảng ngày',
  usage: '!checkall <dd/mm/yyyy> [dd/mm/yyyy]',
  example: [
    '!checkall 26/02/2026',
    '!checkall 25/02/2026 26/02/2026'
  ],

  async execute(message, args, client) {
    try {

      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Bạn không có quyền sử dụng lệnh này.')
      }

      if (args.length < 1) {
        return message.reply('Cú pháp: `!checkall <dd/mm/yyyy> [dd/mm/yyyy]`')
      }

      const from = args[0]
      const to = args[1] || null

      const sheet = new SheetService(client.config.sheetId, "Attendance Mechanic")
      const data = await sheet.checkAll(from, to)

      if (!Object.keys(data).length) {
        return message.reply('Không có dữ liệu phù hợp.')
      }

      const embeds = []

      // ===== SUMMARY =====

      let totalShift = 0
      let totalCancel = 0
      let totalMinutes = 0

      Object.values(data).forEach(u => {
        totalShift += u.totalShift
        totalCancel += u.totalCancel
        totalMinutes += u.totalMinutes
      })

      const header = new EmbedBuilder()
        .setColor('#00b0f4')
        .setTitle('BÁO CÁO CA TRỰC — TOÀN BỘ NHÂN VIÊN')
        .setDescription(`**Kỳ:** ${from}${to ? ` → ${to}` : ''}`)
        .addFields(
          { name: 'Tổng nhân viên', value: String(Object.keys(data).length), inline: true },
          { name: 'Tổng ca hoàn tất', value: String(totalShift), inline: true },
          { name: 'Tổng ca huỷ', value: String(totalCancel), inline: true },
          { name: 'Tổng thời gian', value: `${totalMinutes} phút (~${(totalMinutes / 60).toFixed(1)}h)`, inline: true }
        )
        .setFooter({ text: 'Sky-bot Attendance System' })
        .setTimestamp()

      embeds.push(header)

      // ===== TABLE =====

      let table = ''
      table += '```\n'
      table += 'Tên nhân viên        | Ca | Huỷ | Tổng giờ\n'
      table += '---------------------------------------------\n'

      Object.values(data).forEach(u => {
        const name = u.name.padEnd(20).slice(0, 20)
        const hours = (u.totalMinutes / 60).toFixed(2)

        table += `${name} | ${String(u.totalShift).padEnd(2)} | ${String(u.totalCancel).padEnd(3)} | ${hours.padStart(7)}h\n`
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
      console.error('[CHECKALL ERROR]', err)
      logError(client, err, 'command: checkall')
      return message.reply('Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ dev.')
    }
  }
}