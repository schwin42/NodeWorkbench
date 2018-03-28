const express = require('express');
const fs = require('fs');
const app = express();
// app.get('/', (req, res) => {res.sendStatus(200)})

//SSL Support
const options = {
    key: fs.readFileSync(__dirname + '/domain.key'),
    cert: fs.readFileSync(__dirname + '/domain.crt')
};
const https = require('https');
const port = 8080;
https.createServer(options, app).listen(port);

// app.use(express.static('public'));
app.use(express.static('js_feat'));

app.listen(function () {
    console.log('Node workbench listening on ' + port);
});
