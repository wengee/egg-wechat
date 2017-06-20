'use strict';

class OfficialError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.official = true;
  }
}

module.exports = OfficialError;
