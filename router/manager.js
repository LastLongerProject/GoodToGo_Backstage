const Router = require('koa-router');
const JWT = require('jsonwebtoken');
const restAPI = require('../models/restAPI');
const getNavList = require('../models/middleware').getNavList;
const checkIsLogin = require('../models/middleware').checkIsLogin;
const checkIsAdmin = require('../models/middleware').checkIsAdmin;

const router = new Router();
const LANDING_PAGE_URL_DEMO = "/manager/demo";
const LANDING_PAGE_URL_LIVE = "/manager/dashboard";

function redirect(ctx) {
    // var user = ctx.session.user;
    // if (user && user.phone === "0911111111")
    //     return ctx.redirect(LANDING_PAGE_URL_DEMO);
    // else
    return ctx.redirect(LANDING_PAGE_URL_LIVE);
}

router.get('/login', async ctx => {
    if (ctx.session.user) return redirect(ctx);
    await ctx.render('login', {
        csrf: ctx.csrf,
        error: null
    });
});

router.post('/login', async ctx => {
    const reqBody = ctx.request.body;
    const serverRes = await restAPI.login({
        phone: reqBody.user,
        password: reqBody.pass
    }, {
        cookie: ctx.cookies.get("uid") ? `uid=${ctx.cookies.get("uid")}` : undefined
    });
    const decoded = JWT.decode(serverRes.headers.authorization);
    ctx.session.user = {
        phone: reqBody.user,
        adminRole: decoded.roleList.find(aRole => aRole.roleType === "admin"),
        ua: ctx.header['user-agent'],
        ip: ctx.ip
    };
    ctx.set("set-cookie", serverRes.headers['set-cookie'])
    redirect(ctx);
});

router.use(checkIsLogin);

router.get('/', async ctx => {
    redirect(ctx);
});

router.get('/dashboard', checkIsAdmin, async ctx => {
    await ctx.render('main', {
        navList: getNavList(ctx.session.user)
    });
});

router.get('/demo', async ctx => {
    await ctx.render('space4m', {
        demo: true
    });
});

router.get('/logout', async ctx => {
    try {
        restAPI.logout(ctx.session.user.adminRole, {
            cookie: ctx.cookies.get("uid") ? `uid=${ctx.cookies.get("uid")}` : undefined
        });
    } catch (err) {}
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