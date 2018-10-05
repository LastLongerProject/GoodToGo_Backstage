$(window).on('load', function () {
    if (window.location.pathname !== "/manager/login") {
        $('#loading_main').css('display', 'none');
        appInit(window);
    }
    var dialog = document.querySelector('dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.querySelector('.close').addEventListener('click', function () {
        dialog.close();
    });
    window.dialog = dialog;
});

function debounce(func, delay) {
    var timer = null;
    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            func.apply(context, args)
        }, delay);
    }
}

function appInit(window) {
    var sortType = null;
    var tmpDynamicLoadingBaseIndex = null;
    var placeholderTxtDict = {
        shop: "店鋪",
        user: "使用者",
        container: "容器"
    };
    var icon = {
        arrowUpward: '<i class="material-icons" role="presentation">arrow_upward</i>',
        arrowDownward: '<i class="material-icons" role="presentation">arrow_downward</i>',
        arrowDropDown: '<i class="material-icons" role="presentation">arrow_drop_down</i>',
        arrowDropUp: '<i class="material-icons" role="presentation">arrow_drop_up</i>'
    };
    var numberToPercentage = function (number, option) {
        if (isNaN(number)) number = 0;
        switch (option) {
            case 'withArrow':
                var arrow = number >= 0 ? icon.arrowUpward : icon.arrowDownward;
                return "(" + arrow + parseFloat(Math.abs(number) * 100).toFixed(1) + "%)";
            case 'withoutParentheses':
                return parseFloat(number * 100).toFixed(1) + "%";
            default:
                return "(" + parseFloat(number * 100).toFixed(1) + "%)";
        }
    };
    var getListRenderingRawCapacity = function (realActiveSection) {
        var table = $("#" + realActiveSection).find('tbody').get(0);
        if (!table) return;
        var table_box = table.getBoundingClientRect();
        var rawHeight;
        switch (realActiveSection) {
            case "user-detail":
                rawHeight = 65;
                break;
            case "delivery":
                rawHeight = 56;
                break;
            default:
                rawHeight = 48;
                break;
        }
        var rawCapacity = Math.floor((window.innerHeight - table_box.top - 44 - $("main").scrollTop()) / rawHeight);
        return rawCapacity > 5 ? rawCapacity : 5;
    };
    var getListRenderingDataLength = function () {
        if (Detail.showed !== null) {
            if (Detail.showed === "shopDetail") return app.shopDetailHistory.length;
            else if (Detail.showed === "userDetail") return app.userDetailHistory.length;
            else if (Detail.showed === "containerDetail") return app.containerDetailHistory.length;
        } else {
            if (Section.active === "shop") return app.shopList.length;
            else if (Section.active === "user") return app.userList.length;
            else if (Section.active === "container") return app.container.data.list.length;
        }
        return -1;
    }
    var dataFilter = function (aData) {
        if (app.searchRegExp) {
            if (Section.active === "user")
                return aData.id.match(app.searchRegExp);
            else if (Section.active === "shop")
                return aData.storeName.match(app.searchRegExp);
        } else {
            return aData;
        }
    };
    var dataSorter = {
        get: function (key) {
            if (this[key]) return this[key];
            else return this.number;
        },
        string: function (dataA, dataB) {
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
        number: function (dataA, dataB) {
            if (app.listRendering.sortDir) return dataB[app.listRendering.keyToSort] - dataA[app.listRendering.keyToSort];
            else return dataA[app.listRendering.keyToSort] - dataB[app.listRendering.keyToSort];
        },
        numberString: function (dataA, dataB) {
            try {
                dataA = parseInt(dataA[app.listRendering.keyToSort]);
                dataB = parseInt(dataB[app.listRendering.keyToSort]);
                if (app.listRendering.sortDir) return dataB - dataA;
                else return dataA - dataB;
            } catch (error) {
                return 1;
            }
        },
        serial: function (dataA, dataB) {
            dataA = parseInt(dataA[app.listRendering.keyToSort].slice(1));
            dataB = parseInt(dataB[app.listRendering.keyToSort].slice(1));
            if (app.listRendering.sortDir) return dataB - dataA;
            else return dataA - dataB;
        },
        time: function (dataA, dataB) {
            dataA = new Date(dataA[app.listRendering.keyToSort]);
            dataB = new Date(dataB[app.listRendering.keyToSort]);
            if (app.listRendering.sortDir) return dataB - dataA;
            else return dataA - dataB;
        }
    };
    var bindKeyUpEvent = function () {
        if (!app.detailIsOpen) var tablePageSwitcher = $('.table-page-switcher');
        else {
            var detailId = Detail.showed.slice(0, Detail.showed.indexOf("Detail")) + "-detail";
            var tablePageSwitcher = $('#' + detailId + ' .table-page-switcher');
        }
        if (tablePageSwitcher.length) {
            tablePageSwitcher.focus();
            tablePageSwitcher.off("keyup");
            tablePageSwitcher.keyup(function (event) {
                if (event.key === "ArrowLeft") {
                    app.flipPage("last");
                } else if (event.key === "ArrowRight") {
                    app.flipPage("next");
                }
            });
        }
    };
    var cleanSearchBar = function () {
        $('.searchbar-field .mdl-textfield__input').val('').parent().removeClass('is-focused').removeClass('is-dirty');
        app.search.txt = "";
    };
    var listRenderingParamInit = function (option) {
        var dataToInit = {
            baseIndex: 1,
            sortDir: null,
            keyToSort: null
        };
        if (option) Object.assign(dataToInit, option);
        Object.assign(app.listRendering, dataToInit);
        sortType = null;
    };
    var Section = {
        showed: null,
        get active() {
            return this.showed;
        },
        open: function (destination, data, daemon) {
            if (!(destination in app)) return;
            if (this.showed !== null) this.close();
            app[destination].show = true;
            tmpDynamicLoadingBaseIndex = null;
            listRenderingParamInit();
            app.search.placeholder = (placeholderTxtDict[destination] ? "在「" + placeholderTxtDict[destination] + "」中搜尋" : "搜尋");
            if (!daemon) {
                $("main").scrollTop(0);
                if (!test) app[destination].data = data;
                app.$nextTick(function () {
                    componentHandler.upgradeDom();
                    bindKeyUpEvent();
                });
            } else {
                if (!test)
                    requestData(destination, function (data) {
                        app[destination].data = data;
                    }, {
                        daemon: true
                    });
            }
            this.showed = destination;
        },
        close: function () {
            var showedSection = this.showed;
            if (showedSection !== null) {
                app[showedSection].show = false;
                this.showed = null;
            }
        }
    };
    var Detail = {
        showed: null,
        open: function (destination, data) {
            if (!(destination in app)) return;
            if (this.showed !== null) this.close();
            app[destination].show = true;
            if (!test) app[destination].data = data;
            if (destination === "search")
                app.$nextTick(function () {
                    componentHandler.upgradeDom();
                    bindKeyUpEvent();
                });
            else
                app.$nextTick(function () {
                    setTimeout(function () {
                        // if (destination === "shopDetail") drawChart(data.chartData);
                        componentHandler.upgradeDom();
                        bindKeyUpEvent();
                    }, 600);
                });
            this.showed = destination;
            $("main").scrollTop(0);
        },
        close: function () {
            var showedDetail = this.showed;
            if (showedDetail !== null) {
                if (showedDetail === "search") {
                    for (var aCategory in app.search.data)
                        app.search.data[aCategory].list = [];
                    app.search.show = false;
                } else {
                    app[showedDetail].data.history = [];
                    app[showedDetail].show = false;
                }
                this.showed = null;
                app.$nextTick(function () {
                    setTimeout(function () {
                        bindKeyUpEvent();
                    }, 600);
                });
            }
        }
    };
    var durationToString = function (duration) {
        var ctr = 0;
        var result = "";
        var addString = function (num, txt) {
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
    var drawChart = function (data) {
        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback(function () {
            var dataTable = google.visualization.arrayToDataTable(data);
            var options = {
                // title: "歷史每週使用量",
                // hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
                vAxis: {
                    minValue: 0
                }
            };
            var chart = new google.visualization.AreaChart($('#chart_div').get(0));
            chart.draw(dataTable, options);
            window.drawChart = function () {
                return chart.draw(dataTable, options);
            };
        });
    };
    var app = new Vue({
        el: "#app",
        mounted: function () {
            var localApp = this;
            $(window).resize(debounce(function () {
                // window.drawChart();
                if ($('table').length) {
                    localApp.listRendering.rawCapacity = getListRenderingRawCapacity(Section.active + (localApp.detailIsOpen ? "-detail" : ""));
                    localApp.listRendering.dataLength = getListRenderingDataLength();
                    localApp.$nextTick(function () {
                        componentHandler.upgradeDom();
                    });
                }
            }, 500));
        },
        updated: function () {
            this.listRendering.rawCapacity = getListRenderingRawCapacity(Section.active + (this.detailIsOpen ? "-detail" : ""));
            this.listRendering.dataLength = getListRenderingDataLength();
            this.$nextTick(function () {
                componentHandler.upgradeDom();
            });
        },
        filters: {
            numberWithCommas: function (number) {
                if (typeof number !== "number") return "0";
                return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            numberToPercentage: numberToPercentage,
            durationToString: function (millisecond) {
                if (isNaN(millisecond)) return millisecond;
                return durationToString(moment.duration(millisecond));
            },
            dateToString: function (date, mode) {
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
            navClickListener: function (destination) {
                cleanSearchBar();
                $('.mdl-layout__obfuscator.is-visible').click();
                requestData(destination, function (data) {
                    Detail.close();
                    Section.open(destination, data);
                });
            },
            aRecordClickListener: function (from, id) {
                var localApp = this;
                var detailToShow = from + "Detail";
                var toRequest = detailToShow + "?id=" + id;
                requestData(toRequest, function (data) {
                    Detail.open(detailToShow, data);
                    tmpDynamicLoadingBaseIndex = localApp.listRendering.baseIndex;
                    cleanSearchBar();
                    listRenderingParamInit();
                });
            },
            aRefreshButtonClickListener: function (type) {
                var typeToRefresh = "refresh/" + type;
                requestData(typeToRefresh, function (data) {
                    if (typeof data === "object") data = "Done";
                    window.showToast(data);
                }, {
                    method: "PATCH"
                });
            },
            closeDetail: function () {
                Detail.close();
                cleanSearchBar();
                listRenderingParamInit({
                    baseIndex: tmpDynamicLoadingBaseIndex || 1
                });
            },
            searchData: function () {
                var txt = this.search.txt;
                if (txt.length < 1) return;
                var toRequest = "search?txt=" + txt;
                if (Section.active === 'index') {
                    toRequest += "&fields=shop,user,container"
                } else if (Section.active === 'container') {
                    toRequest += "&fields=container"
                } else {
                    return;
                }
                requestData(toRequest, function (data) {
                    Detail.open("search", data);
                });
            },
            aSearchResultClickListener: function (category, id) {
                var detailToShow = category + "Detail";
                if (id === -1) return;
                var toRequest = detailToShow + "?id=" + id;
                requestData(toRequest, function (data) {
                    Detail.open(detailToShow, data);
                    Section.open(category, data, true);
                    cleanSearchBar();
                });
            },
            sortList: function (by, type) {
                if (this.listRendering.sortDir == null) this.listRendering.sortDir = true;
                else if (by === this.listRendering.keyToSort) this.listRendering.sortDir = !this.listRendering.sortDir;
                this.listRendering.keyToSort = by;
                if (typeof type === "undefined") sortType = "number";
                else sortType = type;
                this.listRendering.baseIndex = 1;
            },
            showKeySorting: function (txt, key) {
                if (key === this.listRendering.keyToSort) {
                    txt += (this.listRendering.sortDir ? icon.arrowDropDown : icon.arrowDropUp);
                }
                return txt;
            },
            flipPage: function (to) {
                var dataLength;
                if (!this.detailIsOpen) {
                    dataLength = this[Section.active + "List"].length;
                } else {
                    dataLength = this[Section.active + "Detail"].data.history.length;
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
            listMatchCtx: function (data) {
                if (this.searchRegExp) {
                    return data.replace(this.searchRegExp, "<strong>$&</strong>");
                } else {
                    return data;
                }
            },
            numberToPercentage: numberToPercentage,
            openDialog: function () {
                return window.dialog.showModal();
            }
        },
        computed: {
            detailIsOpen: function () {
                return this.search.show || this.shopDetail.show || this.userDetail.show || this.containerDetail.show;
            },
            searchRegExp: function () {
                if (this.search.txt.length > 0) {
                    this.listRendering.baseIndex = 1;
                    var txtArr = this.search.txt.split(" ").filter(
                        function (ele) {
                            return ele !== "";
                        }
                    );
                    txtArr.forEach(function (ele, index, arr) {
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
            shopList: function () {
                if (this.listRendering.keyToSort === null || this.detailIsOpen) {
                    return this.shop.data.list.filter(dataFilter);
                } else {
                    return this.shop.data.list.filter(dataFilter).sort(dataSorter.get(sortType));
                }
            },
            shopDetailHistory: function () {
                if (this.listRendering.keyToSort === null || !this.detailIsOpen) {
                    return this.shopDetail.data.history;
                } else {
                    return this.shopDetail.data.history.sort(dataSorter.get(sortType));
                }
            },
            userList: function () {
                if (this.listRendering.keyToSort === null || this.detailIsOpen) {
                    return this.user.data.list.filter(dataFilter);
                } else {
                    return this.user.data.list.filter(dataFilter).sort(dataSorter.get(sortType));
                }
            },
            userDetailHistory: function () {
                if (this.listRendering.keyToSort === null || !this.detailIsOpen) {
                    return this.userDetail.data.history;
                } else {
                    var lastIndex = this.userDetail.data.history.map(function (ele) {
                        return ele.returnTime;
                    }).lastIndexOf("尚未歸還") + 1;
                    if (this.listRendering.keyToSort !== "returnTime")
                        return this.userDetail.data.history.slice(0, lastIndex).sort(dataSorter.get(sortType))
                            .concat(this.userDetail.data.history.slice(lastIndex).sort(dataSorter.get(sortType)));
                    else
                        return this.userDetail.data.history.slice(0, lastIndex).concat(this.userDetail.data.history.slice(lastIndex).sort(dataSorter.get(sortType)));
                }
            },
            containerDetailHistory: function () {
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
                dataLength: -1,
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
                    shopRecentHistorySummary: {
                        usedAmount: 87,
                        customerLostAmount: 3,
                        totalDuration: 111013967,
                        quantityOfBorrowingFromDiffPlace: 23
                    },
                    shopHistorySummary: {
                        usedAmount: 6487,
                        shopLostAmount: 248,
                        customerLostAmount: 248,
                        totalDuration: 57563433659,
                        quantityOfBorrowingFromDiffPlace: 796
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
            console: {
                show: false,
                data: null
            }
        }
    });
    window.app = app;
    Section.showed = (window.location.hash || "#index").replace("#", "");
    if (!(Section.showed in app)) Section.showed = 'index';
    app.navClickListener(Section.active);
}