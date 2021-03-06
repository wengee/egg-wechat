'use strict';

const ServiceBase = require('./index');

const REMARK_URL = 'https://api.weixin.qq.com/cgi-bin/user/info/updateremark';
const USERINFO_URL = 'https://api.weixin.qq.com/cgi-bin/user/info';
const BATCHGET_URL = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget';
const LIST_URL = 'https://api.weixin.qq.com/cgi-bin/user/get';

class User extends ServiceBase
{
  async remark (openId, remark) {
    let data = this.request('POST', REMARK_URL, {
      data: {
        openid: openId,
        remark
      }
    });

    return data.errcode === 0;
  }

  async fetch (openId, lang = 'zh_CN') {
    return await this.request('GET', USERINFO_URL, {
      data: {
        openid: openId,
        lang
      }
    });
  }

  async batchGet (openIds, lang = 'zh_CN') {
    if (_.isString(openIds)) {
      openIds = [openIds];
    } else if (!_.isArray(openIds)) {
      return false;
    }

    let userList = [];
    openIds.forEach(user => {
      if (Object.prototype.toString.call(user) === '[object Object]') {
        userList.push(user);
      } else {
        userList.push({
          openid: user,
          lang
        });
      }
    })

    let data = this.request('POST', BATCHGET_URL, {
      data: {
        user_list: userList
      }
    });

    return data.user_info_list;
  }

  async list (nextOpenId) {
    return await this.request('GET', LIST_URL, {
      data: {
        next_openid: nextOpenId
      }
    });
  }
}

module.exports = User;
