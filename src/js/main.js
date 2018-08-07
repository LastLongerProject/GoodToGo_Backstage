// window.addEventListener("load", function() {
//     console.log(window.location.hash)

function initPage() {
    $(window.location.hash || "#index").addClass('is-active');
    $(".mdl-navigation__link[href='" + (window.location.hash || "#index") + "']").addClass('is-active');
};
//     initPage();
//     var navLink_nowActive = $(".mdl-navigation__link.is-active");
//     var navLinks = $(".mdl-navigation__link");
//     var content_nowActive = $(".main-content.is-active");
//     navLinks.click(function navLinkClickListener() {
//         navLink_nowActive.removeClass('is-active');
//         $(this).addClass('is-active');
//         navLink_nowActive = $(this);
//         content_nowActive.removeClass('is-active');
//         content_nowActive = $(navLink_nowActive.attr('href'));
//         content_nowActive.addClass('is-active');
//         $('.mdl-layout__obfuscator.is-visible').click();
//     });
//     $('.content-block-detail-container .content-block-detail-outer').click(function() {
//         if ($(this).parent().hasClass('is-expanded')) {
//             $(this).parent().removeClass('is-expanded');
//             $(this).find('.material-icons').last().text('expand_more');
//         } else {
//             $(this).parent().addClass('is-expanded');
//             $(this).find('.material-icons').last().text('expand_less');
//         }
//     });
// });

function initPage() {
    return window.location.hash || "#index";
};

$(window).ready(function() {
    var showedDetail = null;
    var nowActiveSection = initPage().replace("#", "");
    var arrowUpward = '<i class="material-icons" role="presentation">arrow_upward</i>';
    var arrowDownward = '<i class="material-icons" role="presentation">arrow_downward</i>';
    var arrowDropDown = '<i class="material-icons" role="presentation">arrow_drop_down</i>';
    var numberToPercentage = function(number, withArrow) {
        var arrow = withArrow ? (number > 0 ? arrowUpward : arrowDownward) : "";
        return "(" + arrow + parseFloat(Math.abs(number) * 100).toFixed(1) + "%)";
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
                        return date;
                        break;
                }
            }
        },
        methods: {
            navClickListener: function(event) {
                var destination = event.path[1].getAttribute('href').replace("#", "");
                this[nowActiveSection].show = false;
                if ((nowActiveSection + "Detail") in this) this[nowActiveSection + "Detail"].show = false;
                this[destination].show = true;
                nowActiveSection = destination;
                $('.mdl-layout__obfuscator.is-visible').click();
            },
            aRecordClickListener: function(from, index) {
                showedDetail = from + "Detail";
                this[showedDetail].show = true;
                console.log(index);
            },
            closeDetail: function() {
                this[showedDetail].show = false;
            },
            numberToPercentage: numberToPercentage
        },
        computed: {
            detailIsOpen: function() {
                return this.shopDetail.show || this.userDetail.show || this.containerDetail.show || this.deliveryDetail.show;
            }
        },
        data: {
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
                    summary: [{
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

            },
            userDetail: {
                show: false,

            },
            container: {
                show: false,
                data: {
                    containerSummary: [{
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

            },
            delivery: {
                show: false,

            },
            deliveryDetail: {
                show: false,

            }
        }
    });
});