const htbase = "https://api.veripass.uk";
const wsbase = "wss://api.veripass.uk";
const connectUrl = wsbase + "/v1/c/connect";
const reconnect = 5;

let reconnectTimer = undefined;
let socketWs = undefined;

function getHtBase() {
    return htbase
}

class DummyCallback {
  onError(data) {
    console.log("[DummyCallback] Error data: " + (data && JSON.stringify(data) || 'empty'));
  }

  onSuccess(data) {
    console.log("[DummyCallback] Success data: " + (data && JSON.stringify(data) || 'empty'));
  }
}

const dummyCallback = new DummyCallback();

function _createCORSRequest(method, uri) {
  const url = htbase + uri
  console.log(method, url);
  let xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

function _sendRequest(uri, creds, data, callback = dummyCallback) {
  const pid = creds.pid;
  const token = creds.token;

  if (!pid || !token) {
    console.warn("Not registerd");
  } else {
    let method = (data === undefined) ? "GET" : "POST";
    let xhr = _createCORSRequest(method, uri);
    xhr.setRequestHeader("Authorization", 'VPC pid=' + pid + ', token=' + token);
    if (data === undefined) {
      xhr.send();
    } else {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    }
    xhr.onload = function () {
      if (xhr.status === 403) {
        console.warn("need registering");
        //FIXME callback.onError({
        //   pid: undefined,
        //   auth: false
        // });
      } else if (xhr.status === 401) {
        console.warn("need authenticating");
        //FIXME callback.onError({auth: false}); -> it should do setState({auth: false}) on the main component
        window.location.hash="#authenticate"
      } else if (xhr.status === 200) {
        //FIXME callback.onSuccess({auth: true}); -> it should do setState({auth: true}) on the main component
        if (callback !== undefined) callback(xhr.response);
      } else if (xhr.status === 202) {
        //FIXME callback.onSuccess({auth: true}); -> it should do setState({auth: true}) on the main component
        if (callback !== undefined) callback(xhr.response);
      } else {
        console.error("renewing failed:", xhr.status);
      }
    };
  }
}

function _updateSession(_ssid) {
  sessionStorage.setItem('ssid', _ssid);
}

function connect(handler) {
  let sid = sessionStorage.getItem('ssid') ? sessionStorage.getItem('ssid') : JSON.stringify(Math.floor(Math.random() * 1000000000));
  _updateSession(sid);
  handler.onSessionUpdate(sid);

  let ws = new WebSocket(connectUrl);
  ws.binaryType = 'arraybuffer';
  ws.onopen = function(event) {
    console.log("WebSocket connection established: ", connectUrl);
    handler.onOpen();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
  };

  ws.onerror = function(event) {
    console.log(event);
  };

  ws.onclose = function(event) {
    handler.onClose(event);
    if (event.code === 1006) {
      //something in the amazon infrastructure closes the websockets after 1 minute (even without ELB!)
      console.log("WebSocket connection closed by remote peer, attempting again in " + reconnect + " seconds.. ");
      reconnectTimer = setTimeout(() => connect(handler), reconnect * 1000);
    } else if (event.code !== 1000) {
      console.log("WebSocket closed", event.code, event.reason);
      console.log("WebSocket closed reason", event.reason);
      console.log("WebSocket reconnecting in " + reconnect + " seconds.. ");
      reconnectTimer = setTimeout(() => connect(handler), reconnect * 1000);
    }
  };

  ws.onmessage = (msg) => {
    handler.onMessage(msg);
  };

  socketWs = ws;
}

function sendApproveConsent(creds, alias, contact) {
  _sendRequest("/v1/c/approved", creds, {alias: alias, contact: contact});
}

function sendRejectConsent(creds, alias, contact) {
  _sendRequest("/v1/c/rejected", creds,{alias: alias, contact: contact});
}

function requestResendSms(creds, callback) {
  const xhr = _createCORSRequest("POST", "/v1/c/resend/sms");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(creds));

  xhr.onload = function () {
    if (xhr.status === 202) {
      callback("SMS code has been sent to your phone.", false)
    } else {
      callback("SMS code send failed", true)
    }
  }
}

function updateChild(creds, data) {
  _sendRequest("/v1/c/child", creds, data);
}

function requestFullView(creds, callback) {
  _sendRequest('/v1/c/fullview', creds, undefined, callback);
}

function sendRegistrationData(data) {
  socketWs.send(JSON.stringify(data));
}

function authenticate(data, callback) {
  let xhr = _createCORSRequest('POST', '/v1/c/authenticate');
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = () => {
      callback(xhr);
  };
}

function isConnected() {
  return socketWs != undefined;
}

function closeConnection() {
  socketWs.close();
  socketWs = undefined;
}

function signOut(creds, callback) {
  _sendRequest("/v1/c/signout", creds, undefined, callback);
}

function assignConsent(creds, data) {
  _sendRequest("/v1/c/assign", creds, data);
}

export default {
  getHtBase: getHtBase,
  connect: connect,
  sendApproveConsent: sendApproveConsent,
  sendRejectConsent: sendRejectConsent,
  requestResendSms: requestResendSms,
  updateChild: updateChild,
  requestFullView: requestFullView,
  sendRegistrationData: sendRegistrationData,
  authenticate: authenticate,
  isConnected: isConnected,
  closeConnection: closeConnection,
  signOut: signOut,
  assignConsent: assignConsent
};
