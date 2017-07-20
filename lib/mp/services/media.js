'use strict';

const formstream = require('formstream');
const ServiceBase = require('./index');

const GET_URL = 'https://api.weixin.qq.com/cgi-bin/media/get';
const GET_JSSDK_URL = 'https://api.weixin.qq.com/cgi-bin/media/get/jssdk';
const UPLOAD_URL = 'https://api.weixin.qq.com/cgi-bin/media/upload';

class Media extends ServiceBase
{
  async upload (filepath, type = 'image') {
    const form = formstream();
    form.file('media', filepath);

    let data = await this.request('POST', UPLOAD_URL, {
      query: { type },
      headers: form.headers(),
      stream: form,
    });

    return data;
  }

  async get (mediaId, isVideo = false) {
    let res = await this.request('GET', GET_URL, {
      query: { media_id: mediaId },
      streaming: isVideo
    });

    return res;
  }

  async getHdVoice (mediaId) {
    let res = await this.request('GET', GET_JSSDK_URL, {
      query: { media_id: mediaId },
      streaming: true
    });

    return res;
  }
}
