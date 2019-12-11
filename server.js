import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import Main from './src/client/main';

const app = express();

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

// Index page handler
app.get('/', (req, res) => {
  let body = renderToString(<Main />);
  res.render('index', {body: body});
});

app.listen(3000, () => {
  console.log("Server started")
});