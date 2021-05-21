const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #accum = 0;
  #maxSize = 0;

  constructor(options) {
    super(options);
    this.#maxSize = options.limit;
  }

  _transform(chunk, encoding, callback) {
    let error;

    this.#accum += chunk.length;

    if (this.#accum > this.#maxSize) error = new LimitExceededError();

    callback(error, chunk);
  }

  _flush(callback) {
    callback();
  }
}

module.exports = LimitSizeStream;
