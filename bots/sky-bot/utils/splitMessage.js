module.exports = function splitMessage(text, maxLength = 1900) {
  const chunks = []
  let current = ''

  for (const line of text.split('\n')) {
    if ((current + '\n' + line).length > maxLength) {
      chunks.push(current)
      current = line
    } else {
      current += (current ? '\n' : '') + line
    }
  }

  if (current) chunks.push(current)
  return chunks
}