module.exports = {
    checkIsLogin: async function checkUser(ctx, next) {
        if (!ctx.session.user) return ctx.redirect("/manager/login");
        if (ctx.session.user.ua !== ctx.header['user-agent'] || ctx.session.user.ip !== ctx.ip) {
            ctx.session = null;
            return ctx.redirect("/manager/login");
        }
        ctx.state.user = ctx.session.user;
        ctx.state.user.name = ctx.session.user.phone.slice(0, 4) + "-" + ctx.session.user.phone.slice(4, 7) + "-" + ctx.session.user.phone.slice(7, 10);
        await next();
    }
}