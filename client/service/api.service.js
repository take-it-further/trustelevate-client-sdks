const htbase = "https://api.veripass.uk";
const wsbase = "wss://api.veripass.uk";
const connectUrl = wsbase + "/v1/c/connect";
const reconnect = 5;

let reconnectTimer = undefined;
let socketWs = undefined;

class DummyCallback {
  onError(data) {
    console.log("[DummyCallback] Error data: " + (data && JSON.stringify(data) || 'empty'));
  }

  onSuccess(data) {
    console.log("[DummyCallback] Success data: " + (data && JSON.stringify(data) || 'empty'));
  }
}

const dummyCallback = new DummyCallback();

function _createCORSRequest(method, url) {
  let xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, htbase + url, true);
  } else if (typeof XDomainRequest != "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, htbase + url);
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
    let url = htbase + uri;
    let method = (data === undefined) ? "GET" : "POST";
    console.log(method, url);
    let xhr = _createCORSRequest(method, url);
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
        callback.onError({
          pid: undefined,
          auth: false
        });
      } else if (xhr.status === 401) {
        console.warn("need authenticating");
        callback.onError({auth: false});
        window.location.hash="#authenticate"
      } else if (xhr.status === 200) {
        callback.onSuccess({auth: true});
        // TODO: check how response used in callback
        if (callback !== undefined) callback(xhr.response);
      } else if (xhr.status === 202) {
        // TODO: check how response used in callback
        callback.onSuccess({auth: true});
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
      console.log("WebSocket connection closed by remote peer, attempting again in " + main.reconnect + " seconds.. ");
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
  _sendRequest("/v1/c/approved", {alias: alias, contact: contact});
}

function sendRejectConsent(creds, alias, contact) {
  _sendRequest("/v1/c/rejected", {alias: alias, contact: contact});
}

function requestResendSms(creds, callback) {
  const xhr = _createCORSRequest("POST", this.htbase + "/v1/c/resend/sms");
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
