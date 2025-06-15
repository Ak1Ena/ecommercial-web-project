const productList = document.getElementById('filter_row');

async function loadProducts() {
    try {
        // Fetch data
        const response = await fetch('http://localhost:4000/api/products/get');
        const products = await response.json();
        
        // Create all product elements first
        const productElements = products.map(product => {
            const productItem = document.createElement('div');
            productItem.className = `col-lg-3 col-md-4 col-sm-6 mix ${product.category}`;
            const imgUrl = product.img.replace(/\\/g, '/');
            
            productItem.innerHTML = `
                <div class="featured__item">
                    <div class="featured__item__pic set-bg" data-setbg="${imgUrl}" style="background-image: url('${imgUrl}');">
                        <ul class="featured__item__pic__hover">
                            <li><a href="#"><i class="fa fa-heart"></i></a></li>
                            <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                            <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                        </ul>
                    </div>
                    ${product.discount > 0
                        ? `<div class="product__discount__item__text">
                            <span>${product.category}</span>
                            <h5><a href="#">${product.name}</a></h5>
                            <div class="product__item__price">$${(product.price * (1 - product.discount / 100)).toFixed(2)} <span>$${product.price}</span></div>
                        </div>`
                        : `<div class="featured__item__text">
                            <h6><a href="#">${product.name}</a></h6>
                            <h5>$${(product.price * (1 - product.discount / 100)).toFixed(2)}</h5>
                        </div>`
                    }
                </div>
            `;
            return productItem;
        });

        // Add all elements to DOM at once
        productElements.forEach(element => productList.appendChild(element));

        // Initialize or refresh MixItUp
        if (typeof mixer !== 'undefined') {
            mixer.forceRefresh();
        }

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', loadProducts);