const jwt = require('jsonwebtoken');

const secret = process.env.NODE_ENV === 'production' ? process.env.SEED_JSON_WEB_TOKEN : process.env.SEED_JSON_WEB_TOKEN;

const authService = () => {
  const issue = (payload) => jwt.sign(payload, secret, { expiresIn: 10800 });
  const verify = (token, cb) => jwt.verify(token, secret, {}, cb);

  return {
    issue,
    verify,
  };
};

module.exports = authService;
