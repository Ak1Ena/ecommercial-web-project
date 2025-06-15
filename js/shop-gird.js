const minInput = document.getElementById('minamount');
const maxInput = document.getElementById('maxamount');
function loadAllProducts() {
    fetch('http://localhost:4000/api/products/get')
        .then(response => response.json())
        .then(data => {
            document.getElementById('found').textContent = data.length;

            // แยกสินค้าที่มีส่วนลด
            const discountProducts = data.filter(product => product.discount > 0);
            
            // สร้าง Discount Slider
            const productDiscountSlider = document.querySelector('.product__discount__slider');
            if (productDiscountSlider && discountProducts.length > 0) {
                let discountHTML = '';
                
                discountProducts.forEach(product => {
                    let imgPath = product.img.replace(/\\/g, '/');
                    discountHTML += `
                        <div class="col-lg-4">
                            <div class="product__discount__item">
                                <div class="product__discount__item__pic set-bg" data-setbg="${imgPath}" style="background-image: url('${imgPath}');">
                                    <div class="product__discount__percent">-${product.discount}%</div>
                                    <ul class="product__item__pic__hover">
                                        <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                        <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                        <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                                    </ul>
                                </div>
                                <div class="product__discount__item__text">
                                    <span>${product.category}</span>
                                    <h5><a href="#">${product.name}</a></h5>
                                    <div class="product__item__price">$${(product.price * (1 - product.discount / 100)).toFixed(2)} <span>$${product.price}</span></div>
                                </div>
                            </div>
                        </div>`;
                });

                productDiscountSlider.innerHTML = discountHTML;

                // Destroy existing carousel if it exists
                if ($('.product__discount__slider').hasClass('owl-loaded')) {
                    $('.product__discount__slider').owlCarousel('destroy');
                }

                // Initialize new Owl Carousel
                $('.product__discount__slider').owlCarousel({
                    items: 3,
                    loop: true,
                    margin: 10,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true,
                    dots: true,
                    responsive: {
                        0: {
                            items: 1
                        },
                        576: {
                            items: 2
                        },
                        768: {
                            items: 3
                        }
                    }
                });
            }

            // แสดงสินค้าทั้งหมดในรายการปกติ
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = ''; // Clear existing products
            
            data.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'col-lg-4 col-md-6 col-sm-6';
                let imgPath = product.img.replace(/\\/g, '/');
                
                productItem.innerHTML = `
                    <div class="product__item">
                         ${product.discount > 0 
                                ? `<div class="product__discount__item__pic set-bg" data-setbg="${imgPath}" style="background-image: url('${imgPath}');">`
                                : `<div class="product__item__pic set-bg" data-setbg="${imgPath}" style="background-image: url('${imgPath}');">`
                            }
                            ${product.discount > 0 ?`<div class="product__discount__percent">-${product.discount}%</div>` : ''}
                            <ul class="product__item__pic__hover">
                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                            </ul>
                        </div>
                        ${product.discount > 0
                        ?`<div class="product__discount__item__text">
                                <span>${product.category}</span>
                                <h5><a href="#">${product.name}</a></h5>
                                <div class="product__item__price">$${(product.price * (1 - product.discount / 100)).toFixed(2)} <span>$${product.price}</span></div>
                            </div>`
                        
                        :`<div class="product__item__text">
                            <h6><a href="#">${product.name}</a></h6>
                            <h5>$${product.price}</h5>
                        </div>`
                        }
                    </div>`;
                productsList.appendChild(productItem);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}
document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
});
function filterByPriceRange() {
    const min = parseFloat(minInput.value.replace('$', ''));
    const max = parseFloat(maxInput.value.replace('$', ''));

    fetch('http://localhost:4000/api/products/get')
        .then(response => response.json())
        .then(data => {
            const filteredProducts = data.filter(product => {
                const price = product.price * (1 - product.discount / 100);
                return price >= min && price <= max;
            });

            document.getElementById('found').textContent = filteredProducts.length;
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = ''; // Clear existing products

            filteredProducts.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'col-lg-4 col-md-6 col-sm-6';
                let imgPath = product.img.replace(/\\/g, '/');
                
                productItem.innerHTML = `
                    <div class="product__item">
                        ${product.discount > 0 
                            ? `<div class="product__discount__item__pic set-bg" data-setbg="${imgPath}" style="background-image: url('${imgPath}');">`
                            : `<div class="product__item__pic set-bg" data-setbg="${imgPath}" style="background-image: url('${imgPath}');">`
                        }
                            ${product.discount > 0 ? `<div class="product__discount__percent">-${product.discount}%</div>` : ''}
                            <ul class="product__item__pic__hover">
                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                            </ul>
                        </div>
                        ${product.discount > 0
                            ? `<div class="product__discount__item__text">
                                <span>${product.category}</span>
                                <h5><a href="#">${product.name}</a></h5>
                                <div class="product__item__price">$${product.price} <span>$${(product.price * (1 - product.discount / 100)).toFixed(2)}</span></div>
                            </div>`
                            : `<div class="product__item__text">
                                <h6><a href="#">${product.name}</a></h6>
                                <h5>$${(product.price * (1 - product.discount / 100)).toFixed(2)}</h5>
                            </div>`
                        }
                    </div>`;
                productsList.appendChild(productItem);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

    // Add event listeners for price inputs
    minInput.addEventListener('change', filterByPriceRange);
    maxInput.addEventListener('change', filterByPriceRange);
    $(".price-range").slider({
    range: true,
    min: 10,
    max: 999,
    values: [10, 999],
    slide: function (event, ui) {
        $("#minamount").val("$" + ui.values[0]);
        $("#maxamount").val("$" + ui.values[1]);
    },
    stop: function(event, ui) {
        filterByPriceRange();
    }
    });

    $("#minamount").val("$" + $(".price-range").slider("values", 0));
    $("#maxamount").val("$" + $(".price-range").slider("values", 1));