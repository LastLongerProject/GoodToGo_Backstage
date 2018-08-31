$(window).on('load', function() {
    if (window.location.pathname !== "/manager/login") {
        $('#loading_main').css('display', 'none');
        appInit(window);
    }
});

function appInit(window) {
    var needUpdate = false;
    var showedDetail = null;
    var nowActiveSection = (window.location.hash || "#index").replace("#", "");
    if (!$("#" + nowActiveSection).get(0)) nowActiveSection = index;
    var tmpDynamicLoadingBaseIndex = null;
    var placeholderTxtDict = {
        shop: "店鋪",
        user: "使用者",
        container: "容器"
    };
    var arrowUpward = '<i class="material-icons" role="presentation">arrow_upward</i>';
    var arrowDownward = '<i class="material-icons" role="presentation">arrow_downward</i>';
    var arrowDropDown = '<i class="material-icons" role="presentation">arrow_drop_down</i>';
    var numberToPercentage = function(number, option) {
        if (isNaN(number)) number = 0;
        switch (option) {
            case 'withArrow':
                var arrow = number >= 0 ? arrowUpward : arrowDownward;
                return "(" + arrow + parseFloat(Math.abs(number) * 100).toFixed(1) + "%)";
            case 'withoutParentheses':
                return parseFloat(number * 100).toFixed(1) + "%";
            default:
                return "(" + parseFloat(number * 100).toFixed(1) + "%)";
        }
    };
    var rawCapacityCount = function(realActiveSection) {
        var table = $("#" + realActiveSection).find('tbody').get(0);
        if (!table) return;
        var table_box = table.getBoundingClientRect();
        var rawHeight = (realActiveSection !== "user-detail" ? 48 : 65);
        var rawCapacity = Math.floor((window.innerHeight - table_box.top - 44) / rawHeight);
        return rawCapacity > 5 ? rawCapacity : 5;
    };
    var dataFilter = function(aData) {
        if (app.searchRegExp) {
            if (nowActiveSection === "user")
                return aData.id.match(app.searchRegExp);
            else if (nowActiveSection === "shop")
                return aData.storeName.match(app.searchRegExp);
        } else {
            return aData;
        }
    };
    var bindKeyUpEvent = function(destination) {
        if ($("#" + destination).find('.table-page-switcher').length) {
            $(window).keyup(function(event) {
                if (event.key === "ArrowLeft") {
                    app.flipPage("last");
                } else if (event.key === "ArrowRight") {
                    app.flipPage("next");
                }
            });
        } else {
            $(window).off("keyup");
        }
    };
    var cleanSearchBar = function() {
        $('.searchbar-field .mdl-textfield__input').val('').parent().removeClass('is-focused').removeClass('is-dirty').blur();
        app.search.txt = "";
    };
    var durationToString = function(duration) {
        var ctr = 0;
        var result = "";
        var addString = function(num, txt) {
            ctr++;
            result += (ctr === 2 ? " " : "") + num + " " + txt;
        };
        if (duration.get("Y") !== 0) {
            addString(duration.get("Y"), "年");
        }
        if (duration.get("M") !== 0) {
            addString(duration.get("M"), "個月");
        }
        if (ctr == 2) return result;
        if (duration.get("d") !== 0) {
            addString(duration.get("d"), "天");
        }
        if (ctr == 2) return result;
        if (duration.get("h") !== 0) {
            addString(duration.get("h"), "小時");
        }
        if (ctr == 2) return result;
        if (duration.get("m") !== 0) {
            addString(duration.get("m"), "分鐘");
        }
        if (result === "") result += "0";
        return result;
    };
    var app = new Vue({
        el: "#app",
        mounted: function() {
            this[nowActiveSection].show = true;
        },
        filters: {
            numberWithCommas: function(number) {
                return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            numberToPercentage: numberToPercentage,
            durationToString: function(millisecond) {
                if (isNaN(millisecond)) return millisecond;
                return durationToString(moment.duration(millisecond));
            },
            dateToString: function(date, mode) {
                if (date === "尚未歸還") return date;
                var thisMoment = moment(date);
                if (!thisMoment.isValid()) return date;
                switch (mode) {
                    case "only_date":
                        return thisMoment.format("YYYY-MM-DD");
                    case "with_day":
                        return thisMoment.format("YYYY-MM-DD (ddd) HH:mm");
                    default:
                        return thisMoment.format("YYYY-MM-DD HH:mm");
                }
            }
        },
        updated: function() {
            if (needUpdate) {
                componentHandler.upgradeDom();
                needUpdate = false;
            }
            this.dynamicLoading.rawCapacity = rawCapacityCount(nowActiveSection + (this.detailIsOpen ? "-detail" : ""));
        },
        methods: {
            navClickListener: function(destination) {
                var localApp = this;
                if (showedDetail || (nowActiveSection + "Detail") in this) this[showedDetail || (nowActiveSection + "Detail")].show = false;
                cleanSearchBar();
                $('.mdl-layout__obfuscator.is-visible').click();
                requestData(destination, function(data) {
                    localApp[nowActiveSection].show = false;
                    localApp[destination].show = true;
                    if (!test) localApp[destination].data = data;
                    tmpDynamicLoadingBaseIndex = null;
                    localApp.dynamicLoading.baseIndex = 1;
                    nowActiveSection = destination;
                    needUpdate = true;
                    localApp.search.placeholder = (placeholderTxtDict[nowActiveSection] ? "在「" + placeholderTxtDict[nowActiveSection] + "」中搜尋" : "搜尋");
                    bindKeyUpEvent(destination);
                    $('main').scrollTop(0);
                });
            },
            aRecordClickListener: function(from, id) {
                var localApp = this;
                var detailToShow = from + "Detail";
                var toRequest = detailToShow + "?id=" + id;
                requestData(toRequest, function(data) {
                    if (showedDetail) localApp[showedDetail].show = false;
                    localApp[detailToShow].show = true;
                    showedDetail = detailToShow;
                    if (!test) localApp[showedDetail].data = data;
                    tmpDynamicLoadingBaseIndex = localApp.dynamicLoading.baseIndex;
                    localApp.dynamicLoading.baseIndex = 1;
                    cleanSearchBar();
                    $('main').scrollTop(0);
                });
            },
            closeDetail: function() {
                cleanSearchBar();
                this[showedDetail || (nowActiveSection + "Detail")].show = false;
                this[showedDetail || (nowActiveSection + "Detail")].data.history = [];
                showedDetail = null;
                this.dynamicLoading.baseIndex = tmpDynamicLoadingBaseIndex || 1;
            },
            flipPage: function(to) {
                var dataLength;
                if (!this.detailIsOpen) {
                    dataLength = this[nowActiveSection].data.list.length;
                } else {
                    dataLength = this[nowActiveSection + "Detail"].data.history.length;
                }
                var maxIndex = Math.ceil(dataLength / this.dynamicLoading.rawCapacity);
                switch (to) {
                    case "next":
                        this.dynamicLoading.baseIndex = Math.min((this.dynamicLoading.baseIndex + 1), maxIndex);
                        break;
                    case "last":
                        this.dynamicLoading.baseIndex = Math.max((this.dynamicLoading.baseIndex - 1), 1);
                        break;
                }
            },
            searchData: function() {
                var localApp = this;
                var txt = this.search.txt;
                if (txt.length < 1) return;
                var toRequest = "search?txt=" + txt;
                if (nowActiveSection === 'index') {
                    toRequest += "&fields=shop,user,container"
                } else if (nowActiveSection === 'container') {
                    toRequest += "&fields=container"
                } else {
                    return;
                }
                requestData(toRequest, function(data) {
                    showedDetail = "search";
                    localApp[showedDetail].show = true;
                    if (!test) localApp[showedDetail].data = data;
                    $('main').scrollTop(0);
                });
            },
            aSearchResultClickListener: function(category, id) {
                var localApp = this;
                var detailToShow = category + "Detail";
                if (id === -1) return;
                var toRequest = detailToShow + "?id=" + id;
                requestData(toRequest, function(data) {
                    localApp.search.show = false;
                    for (var aCategory in localApp.search.data) {
                        localApp.search.data[aCategory].list = [];
                    }
                    localApp[nowActiveSection].show = false;
                    localApp[category].show = true;
                    nowActiveSection = category;
                    tmpDynamicLoadingBaseIndex = null;
                    localApp.dynamicLoading.baseIndex = 1;
                    needUpdate = true;
                    localApp.search.placeholder = (placeholderTxtDict[nowActiveSection] ? "在「" + placeholderTxtDict[nowActiveSection] + "」中搜尋" : "搜尋");
                    localApp[detailToShow].show = true;
                    showedDetail = detailToShow;
                    if (!test) localApp[showedDetail].data = data;
                    cleanSearchBar();
                    $('main').scrollTop(0);
                    if (!test)
                        requestData(category, function(data) {
                            localApp[category].data = data;
                        }, {
                            daemon: true
                        });
                });
            },
            listMatchCtx: function(data) {
                if (this.searchRegExp) {
                    return data.replace(this.searchRegExp, "<strong>$&</strong>");
                } else {
                    return data;
                }
            },
            numberToPercentage: numberToPercentage
        },
        computed: {
            detailIsOpen: function() {
                return this.search.show || this.shopDetail.show || this.userDetail.show || this.containerDetail.show || this.deliveryDetail.show;
            },
            searchRegExp: function() {
                if (this.search.txt.length > 0) {
                    this.dynamicLoading.baseIndex = 1;
                    var txtArr = this.search.txt.split(" ").filter(
                        function(ele) {
                            return ele !== "";
                        }
                    );
                    txtArr.forEach(function(ele, index, arr) {
                        if (ele.length > 1)
                            arr[index] = ele.split("").join("-*");
                    });
                    var regExpTxt = txtArr.join("|");
                    try {
                        return new RegExp(regExpTxt, 'gi');
                    } catch (error) {
                        return null;
                    }
                } else {
                    return null;
                }
            },
            shopList: function() {
                return this.shop.data.list.filter(dataFilter);
            },
            userList: function() {
                return this.user.data.list.filter(dataFilter);
            }
        },
        data: {
            loading: {
                show: false,
                txt: "載入中..."
            },
            dynamicLoading: {
                baseIndex: 1,
                rawCapacity: 0
            },
            index: {
                show: false,
                data: {
                    summary: {
                        userAmount: 824,
                        storeAmount: 18,
                        activityAmount: 62
                    },
                    activityHistorySummary: {
                        usedAmount: 16774,
                        lostAmount: 135,
                        totalDuration: 12314
                    },
                    shopHistorySummary: {
                        usedAmount: 6487,
                        lostAmount: 248,
                        totalDuration: 57563433659,
                        quantityOfBorrowingFromDiffPlace: 796
                    },
                    shopRecentHistorySummary: {
                        usedAmount: 87,
                        lostAmount: 3,
                        totalDuration: 111013967,
                        quantityOfBorrowingFromDiffPlace: 23
                    }
                }
            },
            search: {
                show: false,
                txt: "",
                placeholder: "搜尋",
                data: {
                    user: {
                        show: true,
                        list: [{
                            id: "0936033091",
                            name: "0936-033-091"
                        }]
                    },
                    container: {
                        show: true,
                        list: [{
                            id: 17,
                            name: "#017　16oz 杯子",
                            type: 0
                        }]
                    },
                    shop: {
                        show: true,
                        list: [{
                            id: 0,
                            name: "布萊恩紅茶"
                        }]
                    },
                    delivery: {
                        show: true,
                        list: []
                    }
                }
            },
            shop: {
                show: false,
                data: {
                    list: [{
                        id: 0,
                        storeName: "店名",
                        toUsedAmount: 0,
                        todayAmount: 0,
                        weekAmount: 0,
                        weekAverage: 0
                    }]
                }
            },
            shopDetail: {
                show: false,
                expand: false,
                data: {
                    storeName: "布萊恩紅茶",
                    toUsedAmount: 24,
                    todayAmount: 2,
                    weekAmount: 18,
                    recentAmount: 18,
                    joinedDate: 1234,
                    contactNickname: "店長",
                    contactPhone: "0988555666",
                    recentAmountPercentage: 0.16,
                    weekAverage: 10,
                    history: [{
                        time: 1234,
                        serial: "#161",
                        action: "借出",
                        owner: "0911-***-521",
                        by: "布萊恩紅茶(阿呆店長)"
                    }]
                }
            },
            activity: {
                show: false,

            },
            user: {
                show: false,
                data: {
                    totalUserAmount: 0,
                    totalUsageAmount: 0,
                    weeklyAverageUsage: 0,
                    totalLostAmount: 0,
                    list: [{
                        id: "",
                        phone: "0912-345-678",
                        usingAmount: 0,
                        lostAmount: 0,
                        totalUsageAmount: 0
                    }]
                }
            },
            userDetail: {
                show: false,
                expand: false,
                data: {
                    userPhone: "0936-003-091",
                    usingAmount: 3,
                    lostAmount: 23,
                    totalUsageAmount: 200,
                    joinedDate: 1234,
                    joinedMethod: "店鋪 (方糖咖啡)",
                    recentAmount: 18,
                    recentAmountPercentage: 0.16,
                    weekAverage: 10,
                    averageUsingDuration: 20 * 60 * 1000,
                    amountOfBorrowingFromDiffPlace: 43,
                    history: [{
                        containerType: "12oz 玻璃杯",
                        containerID: "#101",
                        rentTime: 1234,
                        rentPlace: "布萊恩紅茶",
                        returnTime: 1234,
                        returnPlace: "布萊恩紅茶",
                        usingDuration: 1234
                    }]
                }
            },
            container: {
                show: false,
                data: {
                    list: [{
                        id: 0,
                        type: "類別",
                        totalAmount: 0,
                        toUsedAmount: 0,
                        usingAmount: 0,
                        returnedAmount: 0,
                        toCleanAmount: 0,
                        toDeliveryAmount: 0,
                        toSignAmount: 0,
                        inStorageAmount: 0,
                        lostAmount: 0
                    }]
                }
            },
            containerDetail: {
                show: false,
                expand: false,
                data: {
                    containerID: "#257",
                    containerType: {
                        txt: "16oz 玻璃杯",
                        code: 1
                    },
                    reuseTime: 24,
                    status: "使用中",
                    bindedUser: "0921-**-931",
                    joinedDate: 1234,
                    history: [{
                        tradeTime: 1234,
                        action: "借出",
                        newUser: "0921-***-931",
                        oriUser: "特有種商行(小衛)",
                        comment: ""
                    }]
                }
            },
            delivery: {
                show: false,

            },
            deliveryDetail: {
                show: false,
                expand: false,

            }
        }
    });
    window.app = app;
    app.navClickListener(nowActiveSection);
}