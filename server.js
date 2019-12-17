import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import Main from './src/client/main';
const cookie = require('cookie');
const app = express();

// assignments required for rendering UI part
if (typeof window === 'undefined') {
  global.window = {location: {href: ""}}
}

if (typeof document === 'undefined') {
  global.document = {getElementById: (name) => undefined};
}

if (typeof sessionStorage === 'undefined') {
  global.sessionStorage = {
    getItem: name => undefined,
    setItem: (name, val) => undefined
  }
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use('/assets', express.static('assets'));
app.use(express.static('dist'));

// validates session id from request header
function getSessionType(request) {
  let host = request.get('host')
  if (host.startsWith("local")) {
    return 'local'
  } else if (host == "my.veripass.uk") {
    return ''
  } else if (host == "bt-demo.veripass.uk") {
    return 'trial-session-2019'
    let x = cookie.parse(request.header('X-Cookie') || "")
    let c = cookie.parse(request.header('Cookie') || "")
    return c['SMSESSION'] || x['SMSESSION']
  } else {
    return undefined
  }
}

// Index page handler
app.get('/', (req, res) => {
  let sessionType = getSessionType(req);
  if (sessionType !== undefined) {
    let body = renderToString(<Main sessionType={sessionType}/>);
    res.render('index', {sessionType: sessionType, body: body});
  } else {
    res.status(403).send();
  }
});

app.listen(3000, () => {
  console.log("Server started")
});

