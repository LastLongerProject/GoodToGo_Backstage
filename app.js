const Koa = require('koa');
const csrf = require('koa-csrf');
const etag = require('koa-etag');
const cors = require('@koa/cors');
const render = require('koa-ejs');
const redis = require('koa-redis');
const proxy = require('koa-proxies');
const logger = require('koa-logger');
const Router = require('koa-router');
const helmet = require('koa-helmet');
const respond = require('koa-respond');
const session = require('koa-session');
const compress = require('koa-compress');
const static = require('koa-static-server');
const bodyParser = require('koa-bodyparser');
const conditional = require('koa-conditional-get');

const path = require('path');
const debug = require('debug')('goodtogo_backstage:app');
const debugErr = require('debug')('goodtogo_backstage:err_app');
debug.log = console.log.bind(console);

const config = require('./config/config');
const JWT = require('jsonwebtoken');
const router_manager = require('./routes/manager');

const app = new Koa();
const router = new Router();

const redisClient = redis({
    port: 6379,
    host: config.redisUrl,
    password: config.redisPass,
    db: 2
});

const SESSION_CONFIG = {
    key: config.sessionKey,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    overwrite: false,
    renew: true,
    store: redisClient
};

const proxyMid = proxy('/manager/data', {
    target: config.server_host,
    changeOrigin: true,
    rewrite: path => path.replace(/^\/manager\/data/, '/manage'),
    logs: true,
    events: {
        proxyReq(proxyReq, req, res) {
            const userRole = req.session.user.adminRole;
            proxyReq.setHeader('ApiKey', userRole.apiKey);
            proxyReq.setHeader('Authorization', JWT.sign({
                jti: 'manager',
                iat: Date.now(),
                exp: new Date().setDate(new Date().getDate() + 3)
            }, userRole.secretKey));
        }
    }
});

render(app, {
    root: path.join(__dirname, 'views'),
    viewExt: 'html',
    cache: false
});
regisRedisEvent(redisClient);

app.proxy = true;
app.keys = config.appKeys;
app.context.db = redisClient;
app.use(cors());
app.use(xResponseTime());
app.use(helmet())
app.use(errHandler());
app.use(logger());
app.use(respond());
app.use(compress());
app.use(session(SESSION_CONFIG, app));
app.use(bodyParser());
app.use(conditional());
app.use(etag());
app.use(async (ctx, next) => {
    ctx.state.demo = false;
    await next();
});
// app.use(new csrf());

app.use(async (ctx, next) => {
    if (!ctx.session.user) return next();
    ctx.req.session = ctx.session;
    return proxyMid(ctx, next);
});
app.use(static({
    rootDir: config.rootDir + '/assets',
    rootPath: '/manager/assets'
}));
router.use('/manager', router_manager.routes(), router_manager.allowedMethods());
app.use(router.routes());

app.on('error', (error, ctx) => {
    if (error && typeof error.status === 'undefined')
        debugErr('Err [Server] | ', error, JSON.stringify(ctx));
});

/**
 * Get port from environment.
 */
var port = normalizePort(process.env.PORT || '3000');

/**
 * Create HTTP server.
 * Listen on provided port, on all network interfaces.
 */
var server = app.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function xResponseTime() {
    return async function xResponseTime(ctx, next) {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
    };
}

function errHandler() {
    return async function errHandler(ctx, next) {
        try {
            await next();
        } catch (error) {
            if (ctx.accepts('html')) {
                if (error.hasOwnProperty("name") && error.name === "StatusCodeError") {
                    let response = error.error;
                    if (response.code === "D006")
                        await ctx.render('login', {
                            error: {
                                status: "密碼錯誤",
                                message: "請重新登入"
                            }
                        });
                    else
                        await ctx.render('login', {
                            error: {
                                status: response.code,
                                message: response.message || "something wrong"
                            }
                        });
                } else {
                    debugErr("Err [Response_html] | ", error);
                    await ctx.render('login', {
                        error: {
                            status: error.status || error.statusCode || 500,
                            message: error.message || "something wrong"
                        }
                    });
                }
            } else
                switch (error.status) {
                    case 400:
                        ctx.badRequest(error);
                        break;
                    case 401:
                        ctx.unauthorized(error);
                        break;
                    case 403:
                        ctx.forbidden(error);
                        break;
                    default:
                        debugErr("Err [Response_json] | ", error);
                        ctx.internalServerError(error);
                }
        }
    };
}

function regisRedisEvent(redisClient) {
    redisClient.on('ready', function () {
        debug('redisDB ready');
    });

    redisClient.on('connect', function () {
        debug('redisDB connect');
    });

    redisClient.on('reconnecting', function (delay, attempt) {
        debug('redisDB reconnecting');
    });

    redisClient.on('error', function (err) {
        debugErr('redisDB err ', err);
    });
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}