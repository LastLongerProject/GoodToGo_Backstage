const Router = require('koa-router');
const JWT = require('jsonwebtoken');
const restAPI = require('../models/restAPI');
const checkIsLogin = require('../models/middleware').checkIsLogin;

const router = new Router();

router.get('/login', async ctx => {
    await ctx.render('login', {
        csrf: ctx.csrf
    });
});

router.post('/login', async ctx => {
    const reqBody = ctx.request.body;
    const serverRes = await restAPI.login({
        phone: reqBody.user,
        password: reqBody.pass
    });
    const decoded = JWT.decode(serverRes.headers.authorization);
    ctx.session.user = {
        phone: reqBody.user,
        roles: decoded.roles,
        ua: ctx.header['user-agent'],
        ip: ctx.ip
    };
    ctx.redirect("/manager/dashboard");
});

router.use(checkIsLogin);

router.get('/', async ctx => {
    ctx.redirect("/manager/dashboard");
});

router.get('/dashboard', async ctx => {
    await ctx.render('main');
});

router.get('/demo', async ctx => {
    await ctx.render('demo');
});

router.get('/logout', async ctx => {
    ctx.session = null;
    ctx.redirect("/manager/login");
});

module.exports = router;