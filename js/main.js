/*  ---------------------------------------------------
    Template Name: Ogani
    Description:  Ogani eCommerce  HTML Template
    Author: Colorlib
    Author URI: https://colorlib.com
    Version: 1.0
    Created: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        

        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Gallery filter
        --------------------*/
        $('.featured__controls li').on('click', function () {
            $('.featured__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.featured__filter').length > 0) {
            var containerEl = document.querySelector('.featured__filter');
            window.mixer = mixitup(containerEl,{
                selectors: {
                    target: '.mix'
                }
            });
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Humberger Menu
    $(".humberger__open").on('click', function () {
        $(".humberger__menu__wrapper").addClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").addClass("active");
        $("body").addClass("over_hid");
    });

    $(".humberger__menu__overlay").on('click', function () {
        $(".humberger__menu__wrapper").removeClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").removeClass("active");
        $("body").removeClass("over_hid");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*-----------------------
        Categories Slider
    ------------------------*/
    $(".categories__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 4,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            0: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 3,
            },

            992: {
                items: 4,
            }
        }
    });


    $('.hero__categories__all').on('click', function(){
        $('.hero__categories ul').slideToggle(400);
    });

    /*--------------------------
        Latest Product Slider
    ----------------------------*/
    $(".latest-product__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------------
        Product Discount Slider
    -------------------------------*/
    $(".product__discount__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            320: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 2,
            },

            992: {
                items: 3,
            }
        }
    });

    /*---------------------------------
        Product Details Pic Slider
    ----------------------------------*/
    $(".product__details__pic__slider").owlCarousel({
        loop: true,
        margin: 20,
        items: 4,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------
		Price Range Slider
	------------------------ */
    var rangeSlider = $(".price-range"),
        minamount = $("#minamount"),
        maxamount = $("#maxamount"),
        minPrice = rangeSlider.data('min'),
        maxPrice = rangeSlider.data('max');
    rangeSlider.slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function (event, ui) {
            minamount.val('$' + ui.values[0]);
            maxamount.val('$' + ui.values[1]);
        }
    });
    minamount.val('$' + rangeSlider.slider("values", 0));
    maxamount.val('$' + rangeSlider.slider("values", 1));

    /*--------------------------
        Select
    ----------------------------*/
    $("select").niceSelect();

    /*------------------
		Single Product
	--------------------*/
    $('.product__details__pic__slider img').on('click', function () {

        var imgurl = $(this).data('imgbigurl');
        var bigImg = $('.product__details__pic__item--large').attr('src');
        if (imgurl != bigImg) {
            $('.product__details__pic__item--large').attr({
                src: imgurl
            });
        }
    });

    /*-------------------
		Quantity change
	--------------------- */
    var proQty = $('.pro-qty');
    proQty.prepend('<span class="dec qtybtn">-</span>');
    proQty.append('<span class="inc qtybtn">+</span>');
    proQty.on('click', '.qtybtn', function () {
        var $button = $(this);
        var oldValue = $button.parent().find('input').val();
        if ($button.hasClass('inc')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent().find('input').val(newVal);
    });

})(jQuery);

// window.onload = function() {
//     const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
//     const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//     const targetSpan = document.querySelector('li > a > i.fa-shopping-bag + span');
//     if(targetSpan) {
//         targetSpan.textContent = totalQuantity;
//     }

// }

document.getElementById('search-btn').addEventListener('click', function() {
    const searchInput = document.getElementById('search-input').value.trim();
    console.log('Search button clicked');
    if (searchInput === '') {
        alert('Please enter a search term.');
        return;
    }
    sessionStorage.setItem('searchQuery', searchInput);
    window.location.href = 'shop-grid.html';
});
$(document).ready(function() {
    
    const userId = sessionStorage.getItem('userId');


    if (userId) {
        $('.header__top__right__auth a').html('<i class="fa fa-user"></i> Logout').attr('style', 'background-color:red; color:white; padding:5px 10px; border-radius:5px;');
    } else {
        $('.header__top__right__auth a').html('<i class="fa fa-user"></i> Login').removeAttr('style');
    }

    $(document).on('click', '.fa-shopping-cart, a:has(.fa-shopping-cart)', function(e) {
        e.preventDefault();  // Prevent default link behavior
        e.stopPropagation(); // Stop event bubbling
        console.log($(this).data('product-id'));
        sessionStorage.setItem('productId', $(this).data('product-id'));
        window.location.href = 'shop-details.html';
    });
    $(document).on('click', '.header__top__right__auth a', function(e) {
        e.preventDefault();
        if(userId){
            sessionStorage.clear();
            alert('LogOut successed!')
            window.location.href = 'index.html'
        }else{
            window.location.href = 'login.html'
        }
    });
});

async function getCart(id) {
    const response = await fetch('http://localhost:4000/api/users/cart/get', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });

    const result = await response.json();
    return { result, ok: response.ok };
}

document.addEventListener('DOMContentLoaded', async function () {
    const userId = sessionStorage.getItem('userId');

    const targetSpans = document.querySelectorAll('li > a > i.fa-shopping-bag + span');

    const updateCartCount = (count) => {
        if (targetSpans.length === 0) {
            console.warn('ไม่พบ element ที่ต้องการในหน้านี้');
            return;
        }
        targetSpans.forEach(span => {
            span.textContent = count;
        });
    };

    if (!userId) {
        updateCartCount(0);
        return;
    }

    try {
        const { result, ok } = await getCart(userId);

        if (!ok || !result.cart) {
            updateCartCount(0);
            return;
        }

        const cart = result.cart;
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        updateCartCount(totalQuantity);

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลด cart:', error);
        updateCartCount(0);
    }
});
