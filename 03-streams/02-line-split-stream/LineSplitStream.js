const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #stringBuffer = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lineArray = data.split(os.EOL);

    if (lineArray.length > 1) {

      this.push(this.#stringBuffer + lineArray[0]);

      this.#stringBuffer = lineArray[lineArray.length - 1];

      lineArray
        .slice(1, -1)
        .forEach((str) => this.push(str));

    } else {
      this.#stringBuffer += data;
    }
    callback();
  }

  _flush(callback) {
    callback(null, this.#stringBuffer);
  }
}

module.exports = LineSplitStream;
