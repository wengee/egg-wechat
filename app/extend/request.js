'use strict'

module.exports = {
  getRawBody() {
    if (!this.req) {
      return null
    } else if (this._rawBody) {
      return this._rawBody
    }

    return new Promise((resolve, reject) => {
      let result = ''
      this.req.on('data', (chunk) => {
        result += Buffer.from(chunk).toString()
      })

      this.req.on('end', () => {
        this._rawBody = result
        resolve(result)
      })
    })
  }
}
