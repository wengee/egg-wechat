'use strict';

const _ = require('lodash');
const path = require('path');

module.exports = (client, basePath) => {
  return new Proxy({}, {
    get (target, prop) {
      if (!(prop in target) && _.isString(prop)) {
        try {
          let ClientService = require(path.join(basePath, 'services', prop));
          if (ClientService) {
            target[prop] = new ClientService(client);
          }
        } catch (err) {
        }
      }

      return target[prop];
    }
  })
}

