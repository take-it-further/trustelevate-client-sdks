import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import Main from './src/client/main';

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
function validateSession(sessionId) {
  // return true
  return !!sessionId;
}

// Index page handler
app.get('/', (req, res) => {
  let sessionId = req.header('SMSESSIONID');
  if (validateSession(sessionId)) {
    let body = renderToString(<Main />);
    res.render('index', {body: body});
  } else {
    res.status(403).send();
  }
});

app.listen(3000, () => {
  console.log("Server started")
});

