$(window).on('load', function() {
    if (window.location.pathname !== "/manager/login") {
        $('#loading_main').css('display', 'none');
        appInit(window);
    }
});

function debounce(func, delay) {
    var timer = null;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            func.apply(context, args)
        }, delay);
    }
}

function appInit(window) {
    var showedDetail = null;
    var nowActiveSection = (window.location.hash || "#index").replace("#", "");
    if (!$("#" + nowActiveSection).get(0)) nowActiveSection = index;
    var tmpDynamicLoadingBaseIndex = null;
    var placeholderTxtDict = {
        shop: "店鋪",
        user: "使用者",
        container: "容器"
    };
    var sortType = null;
    var arrowUpward = '<i class="material-icons" role="presentation">arrow_upward</i>';
    var arrowDownward = '<i class="material-icons" role="presentation">arrow_downward</i>';
    var arrowDropDown = '<i class="material-icons" role="presentation">arrow_drop_down</i>';
    var arrowDropUp = '<i class="material-icons" role="presentation">arrow_drop_up</i>';
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
    var dataSorter = {
        get: function(key) {
            if (this[key]) return this[key];
            else return this.number;
        },
        string: function(dataA, dataB) {
            dataA = dataA[app.listRendering.keyToSort].toLowerCase();
            dataB = dataB[app.listRendering.keyToSort].toLowerCase();
            if (app.listRendering.sortDir) {
                if (dataA < dataB) return 1;
                if (dataA > dataB) return -1;
            } else {
                if (dataA < dataB) return -1;
                if (dataA > dataB) return 1;
            }
            return 0;
        },
        number: function(dataA, dataB) {
            if (app.listRendering.sortDir) return dataB[app.listRendering.keyToSort] - dataA[app.listRendering.keyToSort];
            else return dataA[app.listRendering.keyToSort] - dataB[app.listRendering.keyToSort];
        },
        numberString: function(dataA, dataB) {
            try {
                dataA = parseInt(dataA[app.listRendering.keyToSort]);
                dataB = parseInt(dataB[app.listRendering.keyToSort]);
                if (app.listRendering.sortDir) return dataB - dataA;
                else return dataA - dataB;
            } catch (error) {
                return 1;
            }
        },
        serial: function(dataA, dataB) {
            dataA = parseInt(dataA[app.listRendering.keyToSort].slice(1));
            dataB = parseInt(dataB[app.listRendering.keyToSort].slice(1));
            if (app.listRendering.sortDir) return dataB - dataA;
            else return dataA - dataB;
        },
        time: function(dataA, dataB) {
            dataA = new Date(dataA[app.listRendering.keyToSort]);
            dataB = new Date(dataB[app.listRendering.keyToSort]);
            if (app.listRendering.sortDir) return dataB - dataA;
            else return dataA - dataB;
        }
    };
    var bindKeyUpEvent = function() {
        var tablePageSwitcher = $('.table-page-switcher');
        if (tablePageSwitcher.length) {
            tablePageSwitcher.focus();
            tablePageSwitcher.off("keyup");
            tablePageSwitcher.each(function() {
                $(this).keyup(function(event) {
                    if (event.key === "ArrowLeft") {
                        app.flipPage("last");
                    } else if (event.key === "ArrowRight") {
                        app.flipPage("next");
                    }
                });
            });
        }
    };
    var cleanSearchBar = function() {
        $('.searchbar-field .mdl-textfield__input').val('').parent().removeClass('is-focused').removeClass('is-dirty');
        app.search.txt = "";
    };
    var listRenderingParamInit = function(app, option) {
        var dataToInit = {
            baseIndex: 1,
            sortDir: null,
            keyToSort: null
        };
        if (option) Object.assign(dataToInit, option);
        Object.assign(app.listRendering, dataToInit);
        sortType = null;
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
            var localApp = this;
            $(window).resize(debounce(function() {
                if ($('.table-page-switcher').length)
                    localApp.listRendering.rawCapacity = rawCapacityCount(nowActiveSection + (localApp.detailIsOpen ? "-detail" : ""));
            }, 500));
        },
        updated: function() {
            this.listRendering.rawCapacity = rawCapacityCount(nowActiveSection + (this.detailIsOpen ? "-detail" : ""));
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
        methods: {
            navClickListener: function(destination) {
                var localApp = this;
                if (showedDetail || (nowActiveSection + "Detail") in this) {
                    this[showedDetail || (nowActiveSection + "Detail")].data.history = [];
                    this[showedDetail || (nowActiveSection + "Detail")].show = false;
                }
                cleanSearchBar();
                $('.mdl-layout__obfuscator.is-visible').click();
                requestData(destination, function(data) {
                    localApp[nowActiveSection].show = false;
                    localApp[destination].show = true;
                    tmpDynamicLoadingBaseIndex = null;
                    listRenderingParamInit(localApp);
                    nowActiveSection = destination;
                    localApp.search.placeholder = (placeholderTxtDict[nowActiveSection] ? "在「" + placeholderTxtDict[nowActiveSection] + "」中搜尋" : "搜尋");
                    $('main').scrollTop(0);
                    localApp.$nextTick(function() {
                        componentHandler.upgradeDom();
                        bindKeyUpEvent();
                        if (!test) localApp[destination].data = data;
                    });
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
                    tmpDynamicLoadingBaseIndex = localApp.listRendering.baseIndex;
                    listRenderingParamInit(localApp);
                    cleanSearchBar();
                    $('main').scrollTop(0);
                    localApp.$nextTick(function() {
                        if (!test) localApp[showedDetail].data = data;
                    });
                });
            },
            closeDetail: function() {
                cleanSearchBar();
                this[showedDetail || (nowActiveSection + "Detail")].show = false;
                listRenderingParamInit(this, {
                    baseIndex: tmpDynamicLoadingBaseIndex || 1
                });
                this[showedDetail || (nowActiveSection + "Detail")].data.history = [];
                showedDetail = null;
            },
            sortList: function(by, type) {
                if (this.listRendering.sortDir == null) this.listRendering.sortDir = true;
                else if (by === this.listRendering.keyToSort) this.listRendering.sortDir = !this.listRendering.sortDir;
                this.listRendering.keyToSort = by;
                if (typeof type === "undefined") sortType = "number";
                else sortType = type;
                this.listRendering.baseIndex = 1;
            },
            showKeySorting: function(txt, key) {
                if (key === this.listRendering.keyToSort) {
                    txt += (this.listRendering.sortDir ? arrowDropDown : arrowDropUp);
                }
                return txt;
            },
            flipPage: function(to) {
                var dataLength;
                if (!this.detailIsOpen) {
                    dataLength = this[nowActiveSection + "List"].length;
                } else {
                    dataLength = this[nowActiveSection + "Detail"].data.history.length;
                }
                var maxIndex = Math.ceil(dataLength / this.listRendering.rawCapacity);
                switch (to) {
                    case "next":
                        this.listRendering.baseIndex = Math.min((this.listRendering.baseIndex + 1), maxIndex);
                        break;
                    case "last":
                        this.listRendering.baseIndex = Math.max((this.listRendering.baseIndex - 1), 1);
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
                    listRenderingParamInit(localApp);
                    localApp.search.placeholder = (placeholderTxtDict[nowActiveSection] ? "在「" + placeholderTxtDict[nowActiveSection] + "」中搜尋" : "搜尋");
                    localApp[detailToShow].show = true;
                    showedDetail = detailToShow;
                    cleanSearchBar();
                    $('main').scrollTop(0);
                    localApp.$nextTick(function() {
                        componentHandler.upgradeDom();
                        bindKeyUpEvent();
                        if (!test) localApp[showedDetail].data = data;
                    });
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
                    this.listRendering.baseIndex = 1;
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
                if (this.listRendering.keyToSort === null || this.detailIsOpen) {
                    return this.shop.data.list.filter(dataFilter);
                } else {
                    return this.shop.data.list.filter(dataFilter).sort(dataSorter.get(sortType));
                }
            },
            shopDetailHistory: function() {
                if (this.listRendering.keyToSort === null || !this.detailIsOpen) {
                    return this.shopDetail.data.history;
                } else {
                    return this.shopDetail.data.history.sort(dataSorter.get(sortType));
                }
            },
            userList: function() {
                if (this.listRendering.keyToSort === null || this.detailIsOpen) {
                    return this.user.data.list.filter(dataFilter);
                } else {
                    return this.user.data.list.filter(dataFilter).sort(dataSorter.get(sortType));
                }
            },
            userDetailHistory: function() {
                if (this.listRendering.keyToSort === null || !this.detailIsOpen) {
                    return this.userDetail.data.history;
                } else {
                    var lastIndex = this.userDetail.data.history.map(function(ele) {
                        return ele.returnTime;
                    }).lastIndexOf("尚未歸還") + 1;
                    if (this.listRendering.keyToSort !== "returnTime")
                        return this.userDetail.data.history.slice(0, lastIndex).sort(dataSorter.get(sortType))
                            .concat(this.userDetail.data.history.slice(lastIndex).sort(dataSorter.get(sortType)));
                    else
                        return this.userDetail.data.history.slice(0, lastIndex).concat(this.userDetail.data.history.slice(lastIndex).sort(dataSorter.get(sortType)));
                }
            },
            containerDetailHistory: function() {
                if (this.listRendering.keyToSort === null || !this.detailIsOpen) {
                    return this.containerDetail.data.history;
                } else {
                    return this.containerDetail.data.history.sort(dataSorter.get(sortType));
                }
            }
        },
        data: {
            loading: {
                show: false,
                txt: "載入中..."
            },
            listRendering: {
                baseIndex: 1,
                rawCapacity: 1,
                keyToSort: null,
                sortDir: null
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
                    list: []
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
                    history: []
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
                    list: []
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
                    history: []
                }
            },
            container: {
                show: false,
                data: {
                    list: []
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
                    history: []
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