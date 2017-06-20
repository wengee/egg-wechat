'use strict';

const WXAuthCrypt = require('../auth_crypto');
const ServiceBase = require('./index');

const SESSION_KEY_URL = 'https://api.weixin.qq.com/sns/jscode2session';

class OAuth extends ServiceBase
{
  async getSessionKey (code) {
    let data = await this.request('GET', SESSION_KEY_URL, {
      data: {
        appid: this.client.appId,
        secret: this.client.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    this.code = code;
    this.openId = data.openid;
    this.sessionKey = data.session_key;

    return { openId: data.openid, sessionKey: data.session_key };
  }

  async getUserInfo ({ code, sessionKey, encryptedData, iv } = {}) {
    if (code && this.code != code) {
      await this.getSessionKey(code);
    }

    sessionKey = sessionKey || this.sessionKey;
    if (!sessionKey) {
      throw new Error('Illegal session key.');
    }

    let cryptor = new WXAuthCrypt(this.client.appId, sessionKey);
    let decryptedData = cryptor.decrypt(encryptedData, iv);
    if (decryptedData.openId !== this.openId) {
      throw new Error('Illegal encryptedData.');
    }
    return decryptedData;
  }
}

module.exports = OAuth;
