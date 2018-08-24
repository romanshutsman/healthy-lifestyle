const express = require('express');
const path = require('path');
const app = express();

const forceSSL = function() {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(
        ['https://', req.get('Host'), req.url].join('')
      );
    }
    next();
  }
};

app.use(forceSSL());

app.use(express.static(path.join(__dirname, 'admin-panel')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel/index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port);
console.log('HLS - ' + port);

