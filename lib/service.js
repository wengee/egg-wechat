'use strict';

const path = require('path');

const SERVICES = Symbol.for('client#services');

class Service
{
  constructor (client, basePath) {
    this[SERVICES] = {};

    return new Proxy(this, {
      get (target, prop) {
        if (!target[SERVICES][prop]) {
          let ClientService = require(path.join(basePath, 'services', prop));
          if (ClientService) {
            target[SERVICES][prop] = new ClientService(client);
          }
        }

        return target[SERVICES][prop];
      }
    });
  }
}

module.exports = Service
