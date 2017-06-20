'use strict';

const ClientBase = require('../base');
const Service = require('../service');

class Client extends ClientBase
{
  constructor ({ appId, appSecret }) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;

    this.service = new Service(this, __dirname);
  }
}

module.exports = Client;
