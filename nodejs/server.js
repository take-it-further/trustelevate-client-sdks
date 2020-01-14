const express = require('express');
const veripass = require('./veripass-client/AuthService');
const app = express();

app.set("views", "./");
app.set("view engine", "pug");

app.get('/', (req, res) => {
    const apiKey = "trd"
    const apiSalt = "4515000E64CEC6ACFBF6BE5D04816D63"
    const returnUrl = "http://blackdice.com/demo?mac=xyz"
    let url = "https://api.veripass.uk/v2/p/vpr/iframe?return=" + returnUrl
    url = veripass.signUrl(url, apiKey, apiSalt);
    res.render('index', {signature: url});
});

const port = 3000
app.listen(port, () => {
  console.log("Server started, port:", port)
});

