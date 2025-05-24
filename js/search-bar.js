// LINE 55 list of Prodyct 
//const searchButton = document.getElementById('search-button');

// searchButton.addEventListener('click', searchProducts);

function searchProducts() {
    
    const searchInput = document.getElementById('search-input').value.trim();
    const productList = document.getElementById('products-list');
    const products = productList.children;
    const searchTerm = searchInput.toLowerCase();

    if (searchInput === '') {
        for (let i = 0; i < products.length; i++) {
            products[i].style.display = '';
        }
        return;
    }
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const name = product.querySelector('.product__item__text h6 a').textContent.toLowerCase();

        if (name.includes(searchTerm)) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    }

}

