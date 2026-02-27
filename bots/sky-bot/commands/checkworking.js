const { EmbedBuilder, PermissionsBitField } = require('discord.js')
const dayjs = require('dayjs')
const splitMessage = require('../utils/splitMessage')
const sendEmbedsSafe = require('../utils/sendEmbeds')
const workingCache = require('../core/cache/workingCache')
module.exports = {
  name: 'checkworking',
  description: '(Admin) Xem danh sách nhân viên đang làm việc',
  usage: '!checkworking',
  example: ['!checkworking'],

  async execute(message, args, client) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bạn không có quyền sử dụng lệnh này.')
    }

    const cache = workingCache.getAll()

    
    if (!cache || cache.length === 0) {
      return message.reply('Hiện tại không có nhân viên nào đang làm việc.')
    }

    const embeds = []

    // ===== SUMMARY =====

    const header = new EmbedBuilder()
      .setColor(15738)
      .setTitle('DANH SÁCH ĐANG LÀM VIỆC')
      .setDescription(`Tổng số: **${cache.length}** nhân viên`)
      .setFooter({ text: 'Sky-bot Working Monitor' })
      .setTimestamp()

    embeds.push(header)

    // ===== TABLE =====

    let table = ''
    table += '```\n'
    table += 'STT | Nhân viên          | Bắt đầu | Đã làm\n'
    table += '-----------------------------------------------\n'

    let i = 1

    for (const u of cache.values()) {
      const start = dayjs(u.OnTime)
      const minutes = dayjs().diff(start, 'minute')
      const h = Math.floor(minutes / 60)
      const m = minutes % 60

      const name = u.Name.padEnd(20).slice(0, 20)

      table += `${String(i++).padEnd(3)} | ${name} | ${start.format('HH:mm')}  | ${String(h).padStart(2)}h ${String(m).padStart(2)}p\n`
    }

    table += '```'

    // ===== SPLIT =====

    const chunks = splitMessage(table, 3800)

    chunks.forEach((chunk, idx) => {
      const e = new EmbedBuilder()
        .setColor('#1f2937')
        .setDescription(chunk)
        .setFooter({ text: `Trang ${idx + 1}/${chunks.length}` })

      embeds.push(e)
    })

    await sendEmbedsSafe(message, embeds, true)
  }
}