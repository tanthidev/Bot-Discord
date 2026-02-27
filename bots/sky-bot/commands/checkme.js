const SheetService = require('../core/sheet')
const { EmbedBuilder } = require('discord.js')
const splitMessage = require('../utils/splitMessage')
const sendEmbedsSafe = require('../utils/sendEmbeds')

module.exports = {
  name: 'checkme',
  description: 'Xem chi tiết ca trực của bản thân',
  usage: '!checkme <dd/mm/yyyy> [dd/mm/yyyy]',
  example: [
    '!checkme 26/02/2026',
    '!checkme 25/02/2026 26/02/2026'
  ],

  async execute(message, args, client) {

    if (args.length < 1) {
      return message.reply('Cú pháp: `!checkme <dd/mm/yyyy> [dd/mm/yyyy]`')
    }

    let fromDate, toDate = null

    if (args.length >= 2 && args[args.length - 2].includes('/')) {
      fromDate = args[args.length - 2]
      toDate = args[args.length - 1]
    } else {
      fromDate = args[args.length - 1]
    }

    const userId = message.author.id
    const username = message.member?.displayName || message.author.username

    const sheet = new SheetService(client.config.sheetId, 'Attendance Mechanic')
    const data = await sheet.checkOne(userId, fromDate, toDate)

    if (!data.logs.length) {
      return message.reply('Không tìm thấy dữ liệu ca trực phù hợp.')
    }

    const embeds = []

    // ===== HEADER =====

    const header = new EmbedBuilder()
      .setColor('#00b0f4')
      .setTitle(`LỊCH CA TRỰC — ${username}`)
      .setDescription(`**Kỳ:** ${fromDate}${toDate ? ` → ${toDate}` : ''}`)
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
      const status = l.status.padEnd(10)

      table += `${String(i + 1).padEnd(3)} | ${date} | ${on} | ${off} | ${String(l.minutes).padEnd(5)} | ${status}\n`
    })

    table += '```'

    // ===== SPLIT TABLE =====

    const chunks = splitMessage(table, 3800)

    chunks.forEach((chunk, index) => {
      const e = new EmbedBuilder()
        .setColor('#1f2937')
        .setDescription(chunk)
        .setFooter({ text: `Trang ${index + 1}/${chunks.length}` })

      embeds.push(e)
    })

    // ===== SEND SAFE =====

    await sendEmbedsSafe(message, embeds, true)
  }
}