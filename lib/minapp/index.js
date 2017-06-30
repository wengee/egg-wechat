'use strict';

const ClientBase = require('../base');
const service = require('../service');

class Client extends ClientBase
{
  constructor ({ appId, appSecret }) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;

    this.service = service(this, __dirname);
  }
}

module.exports = Client;
