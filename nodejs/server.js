const express = require('express');
const veripass = require('./veripass-client/AuthService');
const app = express();

app.set("views", "./");
app.set("view engine", "pug");

app.get('/', (req, res) => {
    const apiKey = "..."
    const apiSalt = "..."
    const returnUrl = "..."
    let url = veripass.signUrl("https://api.veripass.uk/v2/p/vpr/iframe?return=" + returnUrl, apiKey, apiSalt);
    res.render('index', {signature: url});
});

const port = 3000
app.listen(port, () => {
  console.log("Server started, port:", port)
});

