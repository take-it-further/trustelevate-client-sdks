const express = require('express');
const veripass = require('./veripass-client/AuthService');
const app = express();

app.set("views", "./");
app.set("view engine", "pug");

app.get('/', (req, res) => {
    const apiKey = "trd"
    const apiSalt = "123ABC456DEF789ABC123DEF456ABC12"
    const returnUrl = "http://blackdice.com/demo?mac=xyz"
    let url = "https://api.veripass.uk/v2/p/vpr/iframe?return=" + returnUrl
    url = veripass.signUrl(url, apiKey, apiSalt);
    res.render('index', {signature: url});
});

const port = 3000
app.listen(port, () => {
  console.log("Server started, port:", port)
});

