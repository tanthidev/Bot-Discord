const cron = require('node-cron')
const dayjs = require('dayjs')
const SheetService = require('./sheet')

module.exports = function startCron(client) {

  // chạy mỗi 1 tiếng
  cron.schedule('0 * * * *', async () => {
    try {
      const workingSheet = new SheetService(client.config.sheetId, 'Working Now')
      const attendanceSheet = new SheetService(client.config.sheetId, 'Attendance Mechanic')

      const rows = await workingSheet.getAll()

      if (!rows.length) return

      for (const row of rows) {

        const onTime = dayjs(row.OnTime)
        const diff = dayjs().diff(onTime, 'minute')

        if (diff >= 480) {
        console.log(row.ID);
        
          // Ghi lịch sử cancel
          await attendanceSheet.preappend({
            ...row,
            OffTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            Minutes: 0,
            Status: 'Cancel',
            Note: 'Auto cancel - quên !off'
          })

          // Xóa khỏi Working Now
          await workingSheet.deleteById(row.ID)

          // DM cảnh báo
          try {
            const user = await client.users.fetch(row.DiscordID)
            user.send(`⚠️ Ca trực vào lúc ${row.OnTime} của bạn đã vượt quá 8h và bị *auto cancel*. Vui lòng chú ý dùng \`!off\` đúng lúc ở những ca trực tiếp theo`)
          } catch (err) {}
        }
      }

    } catch (err) {
      console.error('[CRON ERROR]', err)
    }
  })

}