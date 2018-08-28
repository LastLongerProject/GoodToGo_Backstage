const Router = require('koa-router');
const JWT = require('jsonwebtoken');
const restAPI = require('../models/restAPI');
const checkIsLogin = require('../models/middleware').checkIsLogin;

const router = new Router();
const LANDING_PAGE_URL_DEMO = "/manager/demo";
const LANDING_PAGE_URL_LIVE = "/manager/dashboard";

function redirect(ctx) {
    var user = ctx.session.user;
    if (user && user.phone === "0911111111")
        return ctx.redirect(LANDING_PAGE_URL_DEMO);
    else
        return ctx.redirect(LANDING_PAGE_URL_LIVE);
}

router.get('/login', async ctx => {
    if (ctx.session.user) return redirect(ctx);
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
        host: ctx.header['host'],
        ip: ctx.ip
    };
    redirect(ctx);
});

router.use(checkIsLogin);

router.get('/', async ctx => {
    redirect(ctx);
});

router.get('/dashboard', async ctx => {
    await ctx.render('main');
});

router.get('/demo', async ctx => {
    await ctx.render('space4m', {
        demo: true
    });
});

router.get('/logout', async ctx => {
    ctx.session = null;
    ctx.redirect("/manager/login");
});

// router.all("/data/:uri", async ctx => {
//     const uri = ctx.params.uri;
//     const id = ctx.query.id;
//     const method = ctx.method;
//     const reqBody = ctx.request.body;
//     let serverRes;
//     try {
//         serverRes = await restAPI.data(uri + (id ? ("/" + id) : ""), method, reqBody, ctx.session.user.roles.admin);
//         ctx.ok(serverRes.body);
//     } catch (err) {
//         if (err.name !== "StatusCodeError")
//             throw err;
//         ctx.forbidden(err.error.message);
//     }
// });

module.exports = router;