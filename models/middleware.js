module.exports = {
    checkIsLogin: async function checkIsLogin(ctx, next) {
            if (!ctx.session.user) return ctx.redirect("/manager/login");
            if (ctx.session.user.ua !== ctx.header['user-agent'] || ctx.session.user.ip !== ctx.ip) {
                ctx.session = null;
                return ctx.redirect("/manager/login");
            }
            ctx.state.user = ctx.session.user;
            ctx.state.user.name = ctx.session.user.phone.slice(0, 4) + "-" + ctx.session.user.phone.slice(4, 7) + "-" + ctx.session.user.phone.slice(7, 10);
            await next();
        },
        checkIsAdmin: async function checkIsAdmin(ctx, next) {
                let user = ctx.session.user;
                if (user.roles.typeList.indexOf("admin") === -1) return ctx.redirect("/manager/demo");
                await next();
            },
            getNavList: function getNavList(user) {
                return [{
                    id: "index",
                    icon: "home",
                    txt: "首頁"
                }, {
                    id: "shop",
                    icon: "store_mall_directory",
                    txt: "店鋪"
                    // }, {
                    //     id: "activity",
                    //     icon: "event",
                    // txt:"活動"
                }, {
                    id: "user",
                    icon: "supervisor_account",
                    txt: "使用者"
                }, {
                    id: "container",
                    icon: "local_drink",
                    txt: "容器"
                    // }, {
                    //     id: "delivery",
                    //     icon: "local_shipping",
                    // txt:"配送"
                }];
            }
}