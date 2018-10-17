(function (window) {
    var pendingReq = null;

    function requestData(page, cb, option) {
        if (pendingReq) pendingReq.abort();
        if (!option) option = {};
        var daemon = option.daemon || false;
        var method = option.method || "GET";
        if (!daemon) startLoading();
        var requestUrl = "/manager/data/" + page;
        pendingReq = $.ajax(requestUrl, {
                headers: {
                    Accept: "application/json; charset=utf-8",
                },
                dataType: "json",
                method: method
                // timeout: 30 * 1000
            })
            .done(function (data, textStatus, jqXHR) {
                if (!daemon) stopLoading();
                cb(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.code === "B005") {
                    return (window.location.href = $("#logout").attr("href"));
                }
                if (!daemon) stopLoading();
                if (jqXHR.statusText !== "abort") {
                    var txt = jqXHR.responseJSON ? jqXHR.responseJSON.message : jqXHR.statusText || "Unknown ERR";
                    showToast("[" + jqXHR.status + "]: " + txt);
                }
            })
            .always(function () {
                pendingReq = null;
            });
    }

    function requestDataDemo(page, cb, option) {
        if (pendingReq) clearTimeout(pendingReq);
        startLoading();
        pendingReq = setTimeout(function () {
            pendingReq = null;
            stopLoading();
            cb();
        }, 500);
    }

    function startLoading() {
        app.loading.txt = "Loading...";
        app.loading.show = true;
    }

    function stopLoading() {
        app.loading.show = false;
        app.loading.txt = "";
    }

    function showToast(msg) {
        document.querySelector("#toast").MaterialSnackbar.showSnackbar({
            message: msg,
            timeout: 4000,
        });
    }

    window.test = false;
    window.requestData = function (page, cb, option) {
        if (!window.test) return requestData(page, cb, option);
        else return requestDataDemo(page, cb, option);
    };
    window.showToast = showToast;
})(window);