const Koa = require('koa');
const csrf = require('koa-csrf');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const Router = require('koa-router');
const helmet = require("koa-helmet");
const respond = require('koa-respond');
const compress = require('koa-compress');
const bodyParser = require('koa-bodyparser');

const debug = require('debug')('goodtogo_backstage:app');
const debugErr = require('debug')('goodtogo_backstage:err_app');
debug.log = console.log.bind(console);

const router_manager = require('./router/manager');

const app = new Koa();
const router = new Router();

app.keys = ['a', 'b'];
app.use(cors());
app.use(xResponseTime());
app.use(helmet())
app.use(errHandler());
app.use(logger());
app.use(respond());
app.use(compress());
app.use(bodyParser());
app.use(new csrf());

router.use('/manager', router_manager.routes(), router_manager.allowedMethods());
app.use(router.routes());

app.on('error', (err, ctx) => {
    debugErr('Err [Server] | ', err, ctx);
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
            debugErr("Err [Response] | ", error);
            ctx.internalServerError(error);
        }
    };
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