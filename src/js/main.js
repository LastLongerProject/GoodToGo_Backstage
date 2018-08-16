function initPage() {
    return window.location.hash || "#index";
};

$(window).on('load', function() {
    $('#loading_main').css('display', 'none');
    appInit(window);
});

function appInit(window) {
    var showedDetail = null;
    var nowActiveSection = initPage().replace("#", "");
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
                return millisecond;
            },
            dateToString: function(date, mode) {
                switch (mode) {
                    case "only_date":
                        return moment(date).format("YYYY-MM-DD");
                        break;
                    default:
                        return moment(date).format("YYYY-MM-DD HH:mm");
                        break;
                }
            }
        },
        methods: {
            navClickListener: function(destination) {
                var localApp = this;
                if ((nowActiveSection + "Detail") in this) this[nowActiveSection + "Detail"].show = false;
                $('.mdl-layout__obfuscator.is-visible').click();
                requestData(destination, function(data) {
                    localApp[nowActiveSection].show = false;
                    localApp[destination].show = true;
                    localApp[destination].data = data;
                    nowActiveSection = destination;
                    $('main').scrollTop(0);
                });
            },
            aRecordClickListener: function(from, index) {
                var localApp = this;
                showedDetail = from + "Detail";
                var toRequest = showedDetail + "?id=" + this[from].data.list[index].id;
                requestData(toRequest, function(data) {
                    localApp[showedDetail].show = true;
                    localApp[showedDetail].data = data;
                    $('main').scrollTop(0);
                });
            },
            closeDetail: function() {
                this[showedDetail || (nowActiveSection + "Detail")].show = false;
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
                        totalDuration: 12314,
                        quantityOfBorrowingFromDiffPlace: 796
                    },
                    shopRecentHistorySummary: {
                        usedAmount: 87,
                        lostAmount: 3,
                        totalDuration: 12314,
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
                    averageUsingDuration: 20 * 1000,
                    percentageOfBorrowingFromDiffPlace: 0.43,
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