const dayjs = require('dayjs')
const SheetService = require('../core/sheet')
const logError = require('../utils/errorLogger')
const workingCache = require('../core/cache/workingCache')


module.exports = {
  name: 'off',
  description: 'Kết thúc ca trực và lưu tổng thời gian làm việc',
  usage: '!off',
  example: ['!off'],

  async execute(message, args, client) {
    try {

      const workingSheet = new SheetService(client.config.sheetId, 'Working Now')
      const attendanceSheet = new SheetService(client.config.sheetId, 'Attendance Mechanic')

      const userId = message.author.id
      const now = dayjs()

      // 1. Tìm ca đang trực trong Working Now
      const workingShift = workingCache.get(userId)

      
      if (!workingShift) {
        return message.reply('Bạn chưa `!on` ca làm hoặc ca đã kết thúc.')
      }

      console.log(workingShift.OnTime);
      
      const onTime = dayjs(workingShift.OnTime)
      const diffMinutes = now.diff(onTime, 'minute')

      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60

      // 2. Ghi vào Attendance Mechanic
      await attendanceSheet.preappend({
        ID: workingShift.ID,
        DiscordID: userId,
        Name: workingShift.Name,
        OnTime: onTime,
        OffTime: now.format('YYYY-MM-DD HH:mm:ss'),
        Date: now.format('YYYY-MM-DD'),
        Minutes: diffMinutes,
        Status: 'Done'
      })

      // 3. Xóa khỏi Working Now
      await workingSheet.deleteById(workingShift.ID)

      // 4. Xóa cache
      workingCache.delete(userId)
      return message.reply({
        embeds: [{
          color: 0x003d7a,
          description: `<@${userId}> đã kết thúc ca làm việc`,
          fields: [
            {
              name: 'Thời gian bắt đầu',
              value: onTime.format('HH:mm:ss'),
              inline: true
            },
            {
              name: 'Thời gian kết thúc',
              value: now.format('HH:mm:ss'),
              inline: true
            },
            {
              name: 'Tổng thời gian',
              value: `${hours}h ${minutes}p`,
              inline: true
            }
          ],
          footer: { text: 'Bot developed by tanthide' }
        }]
      })

    } catch (err) {
      console.error('[OFF COMMAND ERROR]', err)

      // Gửi log lỗi về kênh riêng
      logError(client, err, 'command: off')

      return message.reply('Đã xảy ra lỗi khi kết thúc ca làm. Vui lòng thử lại hoặc liên hệ dev.')
    }
  }
}