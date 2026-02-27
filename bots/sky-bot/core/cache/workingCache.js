const SheetService = require('../sheet')

class WorkingCache {
  constructor() {
    this.cache = new Map()
  }

  async preload(client) {
    console.time('[CACHE] Preload Working Now')

    const sheet = new SheetService(
      client.config.sheetId,
      'Working Now'
    )

    const rows = await sheet.getAll()

    this.cache.clear()

    for (const row of rows) {
      this.cache.set(row.DiscordID, row)
    }

    console.timeEnd('[CACHE] Preload Working Now')
    console.log(`[CACHE] Loaded ${this.cache.size} working shifts`)
  }

  has(userId) {
    return this.cache.has(userId)
  }

  get(userId) {
    return this.cache.get(userId)
  }

  set(userId, row) {
    this.cache.set(userId, row)
  }

  delete(userId) {
    this.cache.delete(userId)
  }

  size() {
    return this.cache.size
  }
}

module.exports = new WorkingCache()