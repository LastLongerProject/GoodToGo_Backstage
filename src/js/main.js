window.addEventListener("load", function(window, event) {
    var navLink_nowActive = $(".mdl-navigation__link.is-active");
    var navLinks = $(".mdl-navigation__link");
    var content_nowActive = $(".main-content.is-active");
    navLinks.click(function navLinkClickListener() {
        navLink_nowActive.removeClass('is-active');
        $(this).addClass('is-active');
        navLink_nowActive = $(this);
        content_nowActive.removeClass('is-active');
        content_nowActive = $(navLink_nowActive.attr('href'));
        content_nowActive.addClass('is-active');
        $('.mdl-layout__obfuscator.is-visible').click();
    });
    // window.location.hash.split("/")[0])
    $('.content-block-detail-container .content-block-detail-outer').click(function() {
        if ($(this).parent().hasClass('is-expanded')) {
            $(this).parent().removeClass('is-expanded');
            $(this).find('.material-icons').last().text('expand_more');
        } else {
            $(this).parent().addClass('is-expanded');
            $(this).find('.material-icons').last().text('expand_less');
        }
    });
});