'use strict';

const http = require('http');

const PORT = 8099;
const MOUNT_CONFIG_URI = 'http://playerservices.streamtheworld.com/api/livestream?lang=en&version=1.5&callsign=WFANAM';
const MOUNT_BRAND = 'WFANAM';

function handleRequest(request, response) {
  response.setHeader('Content-Type', 'audio/mpeg');
  response.setHeader('Transfer-Encoding', 'chunked');
  console.log('got yo equest');
  getWfanUrl((err, url) => {
    http.get(url, (res) => {
      res.setEncoding('binary');
      res.on('data', (chunk) => {
        response.write(chunk, 'binary', () => {
//          response.writeContinue();
        });
      })
      res.on('end', () => {
        response.end('done!');
      })
    })
  });
}

function getWfanUrl(callback) {
  console.log('we gonna get the url');
  http.get(MOUNT_CONFIG_URI, (res) => {
    console.log('we movin here');
    let body = '';

    if(res.statusCode !== 200) {
      callback(res.statusCode);
    }


    else {
      res.setEncoding('utf8');

      res.on('data', data => {
        body += data
      });
      res.on('end', () => {
        console.log('the xml has ended');
        const uriBeginIndex = body.indexOf('<ip>') + '<ip>'.length;
        const uriEndIndex = body.indexOf('</ip>');
	const domain = body.substring(uriBeginIndex, uriEndIndex);

        const mountSuffixBegin = body.indexOf('mountSuffix="') + 'mountSuffix="'.length;
        const mountSuffixEnd = body.indexOf('"/>');
        const mountSuffix = body.substring(mountSuffixBegin, mountSuffixEnd);

        callback(null, 'http://' + domain + '/' + MOUNT_BRAND + mountSuffix);
      })
    }
  })
  .on('error', (e) => {
    console.log(e);
  })
}

const server = http.createServer(handleRequest);

server.listen(PORT, function() {
  console.log('we listening on', PORT);
})
