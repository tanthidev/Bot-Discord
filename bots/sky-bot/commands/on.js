const { v4: uuidv4 } = require('uuid')
const dayjs = require('dayjs')
const SheetService = require('../../../core/sheet')

module.exports = {
  name: 'on',
  description: 'Bắt đầu ca trực làm việc',
  usage: '!on',
  example: ['!on'],
  async execute(message, args, client) {

    const sheet = new SheetService(client.config.sheetId, "Working Now")

    const userId = message.author.id
    const username = message.member?.displayName || message.author.username
    // 1. Check đang có ca working không
    const workingShift = await sheet.find(row =>
      row.DiscordID === userId && row.Status === 'Working'
    )


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

    await sheet.append(row)

    return message.reply({
      embeds: [{
        color: 0x003d7a,
        title: 'BẮT ĐẦU CA LÀM VIỆC',
        description: `<@${userId}> đã **bắt đầu ca làm việc**`,
        fields: [
          {
            name: 'Thời gian bắt đầu',
            value: now.format('HH:mm:ss'),
            inline: true
          },
        ],
        footer: {
          text: 'Nhớ kết thúc ca bằng lệnh !off khi hoàn thành công việc'
        },
        timestamp: new Date()
      }]
    })
  }
}