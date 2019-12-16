const nodeUrl = require('url');
const crypto = require('crypto');
const moment = require('moment');

function _signUrl(url, apiKey, apiSalt) {
  let hash = timeBasedHash(nodeUrl.parse(url).pathname, apiSalt)
  let signature = apiKey + ":" + hash;
  if (u.query) {
    return `${url}&signature=` + encodeURIComponent(signature);
  } else {
    return `${url}?signature=` + encodeURIComponent(signature);
  }
}


function timeBasedHash(arg, hexSalt, offsetInMins = 0) {

  console.log("Arg: " + arg);

  let utcTime = moment().utc()
    .startOf('minute')
    .add(offsetInMins, 'minutes');
  console.log("Utc time: " + utcTime.toString());

  let ts = utcTime.unix();

  let tsBuffer = Buffer.alloc(8);
  writeBigInt64BE(tsBuffer, BigInt(ts));

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

// below functions required for support of NodeJs 10.x versions
// source: https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L78-L152
function writeBigInt64BE(buf, value, offset = 0) {
  return writeBigU_Int64BE(
      buf, value, offset, -0x8000000000000000n, 0x7fffffffffffffffn);
}

function writeBigU_Int64BE(buf, value, offset, min, max) {

  let lo = Number(value & 0xffffffffn);
  buf[offset + 7] = lo;
  lo = lo >> 8;
  buf[offset + 6] = lo;
  lo = lo >> 8;
  buf[offset + 5] = lo;
  lo = lo >> 8;
  buf[offset + 4] = lo;
  let hi = Number(value >> 32n & 0xffffffffn);
  buf[offset + 3] = hi;
  hi = hi >> 8;
  buf[offset + 2] = hi;
  hi = hi >> 8;
  buf[offset + 1] = hi;
  hi = hi >> 8;
  buf[offset] = hi;
  return offset + 8;
}

module.exports.signUrl = _signUrl;
