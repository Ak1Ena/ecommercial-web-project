const productList = document.getElementById('filter_row');

fetch('http://localhost:4000/api/products/get')
.then(response => response.json())
.then(data => {
    for(product of data) {
        let productItem = document.createElement('div');
        productItem.className = `col-lg-3 col-md-4 col-sm-6 `;
        productItem.classList.add('mix', product.category); 
        const imgUrl = product.img.replace(/\\/g, '/');  // Replace all backslashes with forward slashes
        productItem.innerHTML = `
                    <div class="featured__item">
                        <div class="featured__item__pic set-bg" data-setbg="${imgUrl}" style="background-image: url('${imgUrl}');">
                            <ul class="featured__item__pic__hover">
                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                            </ul>
                        </div>
                        <div class="featured__item__text">
                            <h6><a href="#">${product.name}</a></h6>
                            <h5>$${product.price}</h5>
                        </div>
                    </div>
        `;
        productList.appendChild(productItem);
        mixer.append(productItem);
    };

});