function initPage() {
    return window.location.hash || "#index";
};

function durationToString(duration) {
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
}

$(window).on('load', function() {
    if (window.location.pathname !== "/manager/login") {
        $('#loading_main').css('display', 'none');
        appInit(window);
    }
});

function appInit(window) {
    var needUpdate = false;
    var showedDetail = null;
    var nowActiveSection = initPage().replace("#", "");
    if (!$("#" + nowActiveSection).get(0)) nowActiveSection = index;
    var tmpDynamicLoadingBaseIndex = null;
    var arrowUpward = '<i class="material-icons" role="presentation">arrow_upward</i>';
    var arrowDownward = '<i class="material-icons" role="presentation">arrow_downward</i>';
    var arrowDropDown = '<i class="material-icons" role="presentation">arrow_drop_down</i>';
    var numberToPercentage = function(number, option) {
        switch (option) {
            case 'withArrow':
                var arrow = number >= 0 ? arrowUpward : arrowDownward;
                return "(" + arrow + parseFloat(Math.abs(number) * 100).toFixed(1) + "%)";
                break;
            case 'withoutParentheses':
                return parseFloat(number * 100).toFixed(1) + "%";
                break;
            default:
                return "(" + parseFloat(number * 100).toFixed(1) + "%)";
                break;
        }
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
                if ((nowActiveSection + "Detail") in this) this[nowActiveSection + "Detail"].show = false;
                $('.mdl-layout__obfuscator.is-visible').click();
                requestData(destination, function(data) {
                    localApp[nowActiveSection].show = false;
                    localApp[destination].show = true;
                    if (!test) localApp[destination].data = data;
                    tmpDynamicLoadingBaseIndex = null;
                    localApp.dynamicLoading.baseIndex = 1;
                    nowActiveSection = destination;
                    needUpdate = true;
                    $('main').scrollTop(0);
                });
            },
            aRecordClickListener: function(from, index) {
                var localApp = this;
                showedDetail = from + "Detail";
                var toRequest = showedDetail + "?id=" + this[from].data.list[index].id;
                requestData(toRequest, function(data) {
                    localApp[showedDetail].show = true;
                    if (!test) localApp[showedDetail].data = data;
                    tmpDynamicLoadingBaseIndex = localApp.dynamicLoading.baseIndex;
                    localApp.dynamicLoading.baseIndex = 1;
                    $('main').scrollTop(0);
                });
            },
            closeDetail: function() {
                this[showedDetail || (nowActiveSection + "Detail")].show = false;
                this[showedDetail || (nowActiveSection + "Detail")].data.history = [];
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
            numberToPercentage: numberToPercentage
        },
        computed: {
            detailIsOpen: function() {
                return this.shopDetail.show || this.userDetail.show || this.containerDetail.show || this.deliveryDetail.show;
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

            },
            shop: {
                show: false,
                data: {
                    list: [{
                        id: 0,
                        storeName: "布萊恩紅茶",
                        toUsedAmount: 24,
                        todayAmount: 2,
                        weekAmount: 18,
                        weekAverage: 10
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
                    totalUserAmount: 2500,
                    totalUsageAmount: 2500,
                    weeklyAverageUsage: 2500,
                    totalLostAmount: 12,
                    list: [{
                        id: 0,
                        phone: "0912345678",
                        usingAmount: 25,
                        lostAmount: 1,
                        totalUsageAmount: 30
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
                            type: "16oz 玻璃杯",
                            totalAmount: 286,
                            toUsedAmount: 106,
                            usingAmount: 20,
                            returnedAmount: 19,
                            toCleanAmount: 41,
                            toDeliveryAmount: 24,
                            toSignAmount: 0,
                            inStorageAmount: 15,
                            lostAmount: 161
                        },
                        {
                            id: 1,
                            type: "12oz 玻璃杯",
                            totalAmount: 393,
                            toUsedAmount: 50,
                            usingAmount: 23,
                            returnedAmount: 17,
                            toCleanAmount: 22,
                            toDeliveryAmount: 0,
                            toSignAmount: 0,
                            inStorageAmount: 111,
                            lostAmount: 170
                        },
                        {
                            id: 2,
                            type: "16oz 把手杯",
                            totalAmount: 56,
                            toUsedAmount: 1,
                            usingAmount: 0,
                            returnedAmount: 0,
                            toCleanAmount: 2,
                            toDeliveryAmount: 0,
                            toSignAmount: 0,
                            inStorageAmount: 49,
                            lostAmount: 4
                        }
                    ]
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

function rawCapacityCount(nowActiveSection) {
    var table = $("#" + nowActiveSection).find('tbody').get(0);
    if (!table) return;
    var table_box = table.getBoundingClientRect();
    var rawHeight = (nowActiveSection !== "user-detail" ? 48 : 65);
    var rawCapacity = Math.floor((window.innerHeight - table_box.top - 28) / rawHeight);
    return rawCapacity > 5 ? rawCapacity : 5;
}