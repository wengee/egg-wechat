'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const urllib = require('urllib');
const assert = require('assert');
const qs = require('query-string');
const WXBizMsgCrypt = require('wechat-crypto');
const Collection = require('./collection')
const OfficialError = require('./official-error');
const { replyTpl, encryptWrap } = require('./template');
const { xmlParse } = require('./xmlparse');

const checkSignature = function (query, token) {
  let signature = query.signature;
  let timestamp = query.timestamp;
  let nonce = query.nonce;

  let shasum = crypto.createHash('sha1');
  let arr = [token, timestamp, nonce].sort();
  shasum.update(arr.join(''));

  return shasum.digest('hex') === signature;
}

const formatMessage = function (message) {
  let result = {};
  _.forEach(message, (item, index) => {
    result[_.camelCase(index)] = item;
  });
  return result;
}

class ClientBase
{
  get cryptor () {
    if (this.encodingAESKey) {
      return WXBizMsgCrypt(this.token, this.encodingAESKey, this.appId);
    } else {
      return null;
    }
  }

  async request (method, url, options = {}) {
    options.query = options.query || {};
    if (this.accessToken && !options.accessToken && options.accessToken !== false) {
      options.query.access_token = await this.accessToken();
    }

    options.dataType = options.dataType || 'json';
    options.contentType = options.contentType || 'json';

    if (!_.isEmpty(options.query)) {
      url = url + (url.indexOf('?') === -1 ? '?' : '&') + qs.stringify(options.query);
    }

    let r;
    options.method = method;
    delete(options.query);
    try {
      r = await urllib.request(url, options);
      assert(res.status === 200, 'Could not connect to api server.');
    } catch (e) {
      throw new OfficialError(-1, e.message);
    }

    if (options.streaming) {
      return r.res;
    }

    let data = r.data;
    if (options.dataType.toUpperCase() === 'JSON') {
      if (data && data.errcode)
        throw new OfficialError(data.errcode, data.errmsg);

      data = new Collection(data);
    }

    return data;
  }

  async parseEncryptMessage(request) {
    if (!this.cryptor) {
      throw new Error('Invalid cryptor');
    }

    let signature = request.query.msgSignature;
    let timestamp = request.query.timestamp;
    let nonce = request.query.nonce;

    if (request.method === 'GET') {
      const echostr = request.query.echostr;
      if (signature !== this.cryptor.getSignature(timestamp, nonce, echostr)) {
        throw new Error('Invalid signature');
      } else {
        const result = this.cryptor.decrypt(echostr);
        return result.message;
      }
    } else {
      let rawXml = await request.getRawBody()
      if (!rawXml) {
        throw new Error('body is empty');
      }

      let data = await xmlParse(rawXml);
      let encryptMessage = data.Encrypt;
      if (signature !== this.cryptor.getSignature(timestamp, nonce, encryptMessage)) {
        throw new Error('Invalid signature');
      }

      let decrypted = cryptor.decrypt(encryptMessage);
      let messageWrapXml = decrypted.message;
      if (messageWrapXml === '') {
        throw new Error('Invalid appid');
      }

      data = await xmlParse(messageWrapXml);
      data = formatMessage(data);
      this.message = data;
      return data;
    }
  }

  async parseMessage (request) {
    if (request.query.encrypt_type && request.query.msg_signature) {
      return await this.parseEncryptMessage(request);
    } else if (!checkSignature(request.query, this.token)) {
      throw new Error('Invalid signature');
    }

    if (request.method === 'GET') {
      return request.query.echostr;
    } else if (request.method === 'POST') {
      let rawXml = await request.getRawBody();
      let data = await xmlParse(rawXml);
      data = formatMessage(data);
      this.message = data;
      return data;
    }
  }
}

ClientBase.prototype.checkSignature = checkSignature;
module.exports = ClientBase;
