const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (path.dirname(req.url) === '/') {
        const limitStream = new LimitSizeStream({limit: 1048576});
        const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

        req
            .pipe(limitStream)
            .on('error', (error) => {
              fs.unlink(filepath, ()=>{});
              res.statusCode = 413;
              res.end(`Error: 413. Max file size reached: ${error.code}`);
            })
            .pipe(writeStream)
            .on('error', (error) => {
              if (error.code === 'EEXIST') {
                res.statusCode = 409;
                res.end('File already exist');
              } else {
                res.statusCode = 500;
                res.end(error.message);
              }
            });

        writeStream.on('finish', () => {
          res.statusCode = 201;
          res.end('File created');
        });

        req.on('aborted', () => {
          writeStream.destroy();
          fs.unlink(filepath, ()=>{});
        });
      } else {
        res.statusCode = 400;
        res.end('Subdirectories are not allowed');
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
