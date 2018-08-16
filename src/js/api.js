(function(window) {
    var pendingReq = null;

    function requestData(page, cb) {
        if (pendingReq) pendingReq.abort();
        startLoading();
        var requestUrl = "/manager/data/" + page;
        console.log(requestUrl);
        pendingReq = $.ajax(requestUrl, {
                headers: {
                    Accept: "application/json; charset=utf-8"
                },
                dataType: "json",
                timeout: 30 * 1000
            })
            .done(function(data, textStatus, jqXHR) {
                stopLoading();
                cb(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                stopLoading();
                if (jqXHR.statusText !== "abort")
                    showErr("[" + jqXHR.status + "]: " + (jqXHR.responseJSON ? jqXHR.responseJSON.message : jqXHR.statusText || "Unknown ERR"));
            })
            .always(function() {
                pendingReq = null;
            });
    }

    function requestDataDemo(page, cb) {
        if (pendingReq) clearTimeout(pendingReq);
        startLoading();
        var requestUrl = "/manager/data/" + page;
        console.log(requestUrl);
        pendingReq = setTimeout(function() {
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

    function showErr(errMsg) {
        document.querySelector('#toast').MaterialSnackbar.showSnackbar({
            message: errMsg,
            timeout: 4000
        });
    }

    window.requestData = requestData;
    // window.requestData = requestDataDemo;
}(window));