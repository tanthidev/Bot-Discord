const SheetService = require('../../../core/sheet')
const { EmbedBuilder, PermissionsBitField  } = require('discord.js')

module.exports = {
  name: 'checkall',
    description: 'Thống kê toàn bộ ca trực của nhân viên theo ngày hoặc khoảng ngày',
    usage: '!checkall <dd/mm/yyyy> [dd/mm/yyyy]',
    example: [
    '!checkall 26/02/2026',
    '!checkall 25/02/2026 26/02/2026'
    ],
  async execute(message, args, client) {


    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Bạn không có quyền sử dụng lệnh này.')
    }

    if (args.length < 1)
      return message.reply('Cú pháp: `!checkall dd/mm/yyyy dd/mm/yyyy hoặc !checkall dd/mm/yyyy`')

    const from = args[0]
    const to = args[1] || null

    const sheet = new SheetService(client.config.sheetId, "Attendance Mechanic")
    const data = await sheet.checkAll(from, to)


    
    if (Object.keys(data).length === 0) {
      return message.reply('Không có dữ liệu phù hợp.')
    }

    const embeds = []
    let currentEmbed = new EmbedBuilder()
      .setTitle('BÁO CÁO CA TRỰC')
      .setDescription(`**Thời gian:** ${from}${to ? ` → ${to}` : ''}`)
      .setColor('#0099ff')

    let fieldCount = 0
    for (const id in data) {
      const u = data[id]
      const hours = (u.totalMinutes / 60).toFixed(2)

      if (fieldCount === 25) {
        embeds.push(currentEmbed)
        currentEmbed = new EmbedBuilder()
          .setColor('#0099ff')
        fieldCount = 0
      }

      currentEmbed.addFields({
        name: `${u.name}`,
        value: `\`\`\`\nCa hoàn tất: ${u.totalShift}\nCa bị huỷ: ${u.totalCancel}\nTổng thời gian: ${hours} giờ\n\`\`\``,
        inline: false
      })
      fieldCount++
    }

    currentEmbed.setFooter({ text: `Tổng cộng: ${Object.keys(data).length} nhân viên` })
    embeds.push(currentEmbed)

    message.reply({ embeds })
  }
}