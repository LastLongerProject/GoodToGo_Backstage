const JWT = require('jsonwebtoken');
const restAPI = require('../controllers/restAPI');

module.exports = {
    checkIsLogin: async function checkIsLogin(ctx, next) {
        if (!ctx.session.user) return ctx.redirect("/manager/login");
        if (ctx.session.user.ua !== ctx.header["user-agent"] || ctx.session.user.ip !== ctx.ip) {
            ctx.session = null;
            return ctx.redirect("/manager/login");
        }
        ctx.state.user = ctx.session.user;
        const phone = ctx.session.user.phone;
        ctx.state.user.name = `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7, 10)}`;
        await next();
    },
    checkIsAdmin: async function checkIsAdmin(ctx, next) {
        let user = ctx.session.user;
        if (user.adminRole === undefined) return ctx.redirect("/manager/demo");
        if (user.loginAt === undefined || (Date.now() - user.loginAt) > 1000 * 60 * 60 * 2) {
            const serverRes = await restAPI.fetchRole(user.adminRole, {
                cookie: ctx.cookies.get("uid") ? `uid=${ctx.cookies.get("uid")}` : undefined
            });
            const decoded = JWT.decode(serverRes.headers.authorization);
            user.adminRole = decoded.roleList.find(aRole => aRole.roleType === "admin");
            user.loginAt = Date.now();
            if (user.adminRole === undefined) return ctx.redirect("/manager/demo");
        }
        await next();
    },
    getNavList: function getNavList(user) {
        return [{
                id: "index",
                icon: "home",
                txt: "首頁"
                // },
                // {
                //     id: "shop",
                //     icon: "store_mall_directory",
                //     txt: "店鋪"
                // }, {
                //     id: "activity",
                //     icon: "event",
                // txt:"活動"
            },
            {
                id: "user",
                icon: "supervisor_account",
                txt: "使用者"
            },
            {
                id: "container",
                icon: "local_drink",
                txt: "容器"
            },
            {
                id: "delivery",
                icon: "local_shipping",
                txt: "配送",
            },
            {
                id: "console",
                icon: "build",
                txt: "中控台"
            }
        ];
    },
};