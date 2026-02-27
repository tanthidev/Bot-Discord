const { PermissionsBitField } = require('discord.js')
const workingCache = require('../core/cache/workingCache')

module.exports = {
  name: 'reloadcache',
  description: 'Reload cache Working Now từ Google Sheet. Sử dụng khi có sự thay đổi dữ liệu thủ công ở sheet Working Now.',
  usage: '!reloadcache',
  async execute(message) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bạn không có quyền sử dụng lệnh này.')
    }

    const msg = await message.reply('🔄 Đang reload cache từ Google Sheet...')

    try {
      await workingCache.preload(message.client)

      return msg.edit(`Reload cache thành công.`)
    } catch (err) {
      console.error('[RELOAD CACHE ERROR]', err)

      return msg.edit('Reload cache thất bại. Kiểm tra log server.')
    }
  }
}