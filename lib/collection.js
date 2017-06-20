'use strict'

const _ = require('lodash')

class Collection {
  constructor (data) {
    if (!_.isPlainObject(data)) {
      throw new Error('data should be an plain object.')
    }

    this._originData = data
    this._data = {}
    _.each(data, (value, key) => {
      key = key.replace('-', '').replace('_', '').toLowerCase()
      if (_.isPlainObject(value)) {
        this._data[key] = new Collection(value)
      } else {
        this._data[key] = value
      }
    })

    return new Proxy(this, {
      get (target, prop) {
        let dataProp = prop
        if (_.isString(dataProp)) {
          dataProp = dataProp.replace('-', '').replace('_', '').toLowerCase()
        }

        return target[prop] || target._data[dataProp] || null
      }
    })
  }

  remove (key) {
    delete(this._data[key])

    key = key.replace('-', '').replace('_', '').toLowerCase()
    delete(this._data[key])
  }

  toJSON () {
    return this._originData
  }
}

module.exports = Collection
