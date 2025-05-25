const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', searchProducts);

function searchProducts() {
    console.log('Search button clicked');
    const searchInput = document.getElementById('search-input').value.trim();
    const productList = document.getElementById('products-list');
    const productListSearch = document.getElementById('products-list-search');

    if (searchInput === '') {
        alert('Please enter a search term.');
        productList.style.display = '';  
        productListSearch.innerHTML = '';
        productListSearch.style.display = 'none';
        return;
    }

    fetch(`http://localhost:4000/api/products/search?search=${encodeURIComponent(searchInput)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            productList.style.display = 'none';  
            productListSearch.style.display = '';
            productListSearch.innerHTML = '';  

            if (data.length === 0) {
                productListSearch.innerHTML = '<p>No products found.</p>';
                return;
            }

            data.forEach(product => {
                const productItem = document.createElement('div');
                if (product.discount > 0) {
                    productItem.className = 'col-lg-4';
                    productItem.innerHTML = `
                        <div class="product__discount__item" >
                                        <div class="product__discount__item__pic set-bg" data-setbg="${product.img}" style="background-image: url('${product.img}'); ">
                                            <div class="product__discount__percent">-${((product.discount / product.price) * 100).toFixed(0)}%</div>
                                            <ul class="product__item__pic__hover">
                                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                                <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                                <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                                            </ul>
                                        </div>
                                        <div class="product__discount__item__text">
                                            <span>${product.category}</span>
                                            <h5><a href="#">${product.name}</a></h5>
                                            <div class="product__item__price">${product.price - product.discount} <span>${product.price}</span></div>
                                        </div>
                                    </div>

                    `
                } else {
                    productItem.className = 'col-lg-4 col-md-6 col-sm-6';
                    productItem.innerHTML = `
                        <div class="product__item">
                            <div class="product__item__pic set-bg" style="background-image: url('${product.img}')">
                                <ul class="product__item__pic__hover">
                                    <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                    <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                    <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                                </ul>
                            </div>
                            <div class="product__item__text">
                                <h6><a href="#">${product.name}</a></h6>
                                <h5>$${product.price}</h5>
                            </div>
                        </div>
                    `;
                }

                productListSearch.appendChild(productItem);
            });
        })
        .catch(err => console.error('Error fetching products:', err));
}
