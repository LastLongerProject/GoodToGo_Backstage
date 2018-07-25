const path = require('path');
const Router = require('koa-router');

const router = new Router();

router.get('/', async ctx => {
    ctx.ok('Hello World');
});

router.get('/login', async ctx => {
    ctx.ok(ctx.csrf);
    await ctx.render('login', {
        csrf: ctx.csrf
    });
});

router.post('/login', async ctx => {
    ctx.ok();
});

router.post('/logout', async ctx => {
    ctx.ok();
});

module.exports = router;