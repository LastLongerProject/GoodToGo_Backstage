const Router = require('koa-router');

const router = new Router();

router.get('/', async ctx => {
    ctx.ok('Hello World');
});

router.get('/login', async ctx => {
    console.log(ctx.csrf);
    ctx.body = ctx.csrf;
    // ctx.ok(ctx.csrf);
});

module.exports = router;