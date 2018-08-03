const JWT = require('./jwt-promise');
const request = require('request-promise-native');

const config = require('../config/config');

const host = config.server_host;
const jwtKey = config.jwtKey;

module.exports = {
    login: async function login(reqBody) {
        return request(await reqWrapper('/users/login', 'POST', {
            body: reqBody
        }));
    }
}

async function reqWrapper(uri, method, options) {
    let headers;
    let querys;
    const body = options.body;
    const authType = options.authType;
    const userRole = options.userRole;
    switch (authType) {
        case 'JWT':
            if (!userRole.apiKey) throw new Error("Missing apiKey");
            headers = {
                ApiKey: userRole.apiKey,
                Authorization: await JWT.sign({
                    jti: 'manager',
                    iat: Date.now(),
                    exp: new Date().setDate(new Date().getDate() + 3)
                }, jwtKey)
            };
            break;
        default:
            headers = {
                reqID: 'manager',
                reqTime: Date.now()
            };
            break;
    }
    const optionsForReq = {
        method: method,
        uri: host + uri,
        headers: headers,
        qs: querys,
        body: (method === 'POST') ? body : undefined,
        json: true,
        resolveWithFullResponse: true
    };
    return optionsForReq;
}