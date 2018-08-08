function requestData(page, cb) {
    startLoading();
    var requestUrl = "/manager/data/" + page;
    // $.ajax(requestUrl, {
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
    //     .always(function() {});
    console.log(requestUrl);
    setTimeout(function() {
        stopLoading();
        cb();
    })
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