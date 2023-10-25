const jwt = require('jsonwebtoken');
require('dotenv').config();
const generateRestToken = () => {
  return new Promise((res, rej) => {
    jwt.sign(
      {
        iss: process.env.apiKey,
        // iat: Date.now(),
        ist: 'project',
        exp: Date.now() + 200,
        jti: Math.random() * 132,
      },
      process.env.apiSecret,
      { algorithm: 'HS256' },
      function (err, token) {
        if (token) {
          console.log('\n Received token\n', token);
          res(token);
        } else {
          console.log('\n Unable to fetch token, error:', err);
          rej(err);
        }
      }
    );
  });
};

module.exports = {
  generateRestToken,
};
