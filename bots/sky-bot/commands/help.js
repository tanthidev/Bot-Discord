module.exports = {
  name: 'help',
  description: 'Xem danh sách lệnh và cách dùng',
  usage: '!help [command]',
  example: ['!help', '!help checkone'],

  async execute(message, args, client) {

    // !help <command>
    if (args[0]) {
      const cmd = client.commands.get(args[0])
      if (!cmd) return message.reply('Không tìm thấy lệnh này!')

      return message.reply(
        `📌 **Hướng dẫn lệnh !${cmd.name}**\n\n` +
        `Mô tả: ${cmd.description || 'Không có'}\n` +
        `Cú pháp: \`!${cmd.usage || 'Chưa có'}\`\n` +
        `Ví dụ:\n${cmd.example ? cmd.example.map(e => `- ${e}`).join('\n') : 'Không có'}`
      )
    }

    // !help
    let text = '**Danh sách lệnh hiện có:**\n\n'

    for (const cmd of client.commands.values()) {
      text += `- \`!${cmd.name}\` – ${cmd.description || 'Không có mô tả'}\n`
    }

    text += '\n📌 Gõ `!help <tên_lệnh>` để xem chi tiết'

    return message.reply(text)
  }
}