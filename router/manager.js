const Router = require('koa-router');

const router = new Router();

router.get('/', async ctx => {
    ctx.ok('Hello World');
});

module.exports = router;