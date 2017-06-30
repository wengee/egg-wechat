'use strict';

const ClientBase = require('../base');
const service = require('../service');

const ACCESS_TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/component/api_component_token';

class Client extends ClientBase {
  constructor({ appId, appSecret, token, encodingAESKey, ticket }) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
    this.token = token;
    this.encodingAESKey = encodingAESKey;
    this.ticket = ticket;

    this._accessToken = null;
    this.service = service(this, __dirname);
  }

  async accessToken() {
    if (this._accessToken) {
      return this._accessToken;
    } else {
      let token;
      if (Client.redis)
        token = await Client.redis.get(this.appId + '_accessToken');

      if (!token) {
        let data = await this.getAccessToken();

        if (Client.redis)
          await Client.redis.set(this.appId + '_accessToken', data.accessToken, 'EX', data.expiresIn - 600);

        token = data.accessToken;
      }

      this._accessToken = token;
      return token;
    }
  }

  async getAccessToken() {
    let data = await this.request('POST', ACCESS_TOKEN_URL, {
      accessToken: false,
      data: {
        component_appid: this.appId,
        component_appsecret: this.appSecret,
        component_verify_ticket: this.ticket
      }
    });

    return {
      accessToken: data.component_access_token,
      expiresIn: data.expires_in
    };
  }
}

module.exports = Client;
