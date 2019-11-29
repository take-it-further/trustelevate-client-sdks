const express = require('express');
const app = express();
const authService = require('./service/AuthService.js');

// app.use(express.urlencoded);
// app.use(express.json);

app.set("views", "./views");
app.set("view engine", "pug");

// Index page handler
app.get('/', (req, res) => {
  res.render('index');
});

// sim page handler
app.get('/allocatie-sim', (req, res) => {
  const simNum = req.query.sim;
  console.log("Received request for sim num: " + simNum);
  console.log("Request info: " + req.originalUrl);

  let frameSrc = authService.signUrl("/v2/p/vpr/iframe") + "&ttl=60&return=" + encodeURIComponent("http://localhost:3000" + req.originalUrl);
  let vars = {
    sim: simNum,
    frameSrc: frameSrc
  };

  res.render('sim', vars);
});

app.listen(3000);