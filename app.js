'use strict'

const wechat = require('./lib/client')

module.exports = app => {
  wechat.CompClient.redis = app.redis
  wechat.MpClient.redis = app.redis

  app.wechat = wechat
}
