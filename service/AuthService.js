const creds = require('../config/credentials');
const nodeUrl = require('url');
const crypto = require('crypto');
const moment = require('moment');

function timeBasedHash(arg, hexSalt, offsetInMins = 0) {

  console.log("Arg: " + arg);

  let utcTime = moment().utc()
    .startOf('minute')
    .add(offsetInMins, 'minutes');
  console.log("Utc time: " + utcTime.toString());

  let ts = utcTime.unix();

  let tsBuffer = Buffer.alloc(8);
  tsBuffer.writeBigInt64BE(BigInt(ts));

  let buffer = Buffer.concat([
      Buffer.from(hexSalt, 'hex'),
      tsBuffer,
      Buffer.from(arg)
  ]);

  return  crypto.createHash("sha256")
  .update(buffer)
  .digest()
  .toString('hex')
  .toUpperCase();
}

function _signUrl(url) {
  let path = nodeUrl.parse(url).pathname;
  let salt = timeBasedHash(path, creds.apiSalt);

  let signature = creds.apiKey + ":" + salt;

  return `${creds.apiUrl}${url}?signature=` + encodeURIComponent(signature);
}

module.exports.signUrl = _signUrl;
module.exports.apiUrl = creds.apiUrl;