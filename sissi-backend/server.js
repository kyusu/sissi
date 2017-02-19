const express = require('express');
const auth = require('http-auth');

const basic = auth.basic({
    realm: 'K & K',
    file: __dirname + '/users.htpasswd'
});

const app = express();
app.use(auth.connect(basic));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/links.json`);
});

app.listen(process.env.app_port || 3000);
