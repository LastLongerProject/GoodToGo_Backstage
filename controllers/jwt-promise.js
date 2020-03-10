const JWT = require('jsonwebtoken');

module.exports = {
    sign: function sign(payload, secretOrPrivateKey, options) {
        return new Promise((resolve, reject) => {
            JWT.sign(payload, secretOrPrivateKey, options, (err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
        })
    },
    verify: function verify(token, secretOrPrivateKey, options) {
        return new Promise((resolve, reject) => {
            JWT.verify(token, secretOrPrivateKey, options, (err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
        })
    }
}