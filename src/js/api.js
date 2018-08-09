(function(window) {
    var pendingReq = null;

    function requestData(page, cb) {
        // if(pendingReq) pendingReq.abort();
        if (pendingReq) clearTimeout(pendingReq);
        startLoading();
        var requestUrl = "/manager/data/" + page;
        // pendingReq = $.ajax(requestUrl, {
        //         dataType: "json"
        //     })
        //     .done(function(data, textStatus, jqXHR) {
        //         stopLoading();
        //         cb(data);
        //     })
        //     .fail(function(jqXHR, textStatus, errorThrown) {
        //         stopLoading();
        //         showErr(jqXHR.statusText);
        //     })
        //     .always(function() {
        //         pendingReq = null;
        //     });
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
}(window));