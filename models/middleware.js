module.exports = {
    checkIsLogin: async function checkUser(ctx, next) {
        if (!ctx.session.user) return ctx.redirect("/manager/login");
        ctx.state.user = ctx.session.user;
        await next();
    }
}