
window.onload = initShopDetail();

async function initShopDetail() {
    const productid = checkProductId();
    if(!productid) {
        alert("Product ID is invalid or not found.");
        window.location.href = "index.html"; 
        return;
    }
    const product = await loadProductDetails(productid);
    HTMLStruture(product);

}

function HTMLStruture(product){
    if(checkJson(product)) {
        const productDetails = document.getElementById('product-details');
        productDetails.innerHTML = `
            <div class="col-lg-6 col-md-6">
                    <div class="product__details__pic">
                        <div class="product__details__pic__item">
                            <img class="product__details__pic__item--large"
                                src="${product.img}" alt="">
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 col-md-6">
                    <div class="product__details__text">
                        <h3>${product.name}</h3>
                        <div class="product__details__price">$${product.price * (1 - product.discount / 100).toFixed(2)}</div>
                        <div class="product__details__quantity">
                            <div class="quantity">
                                <div class="pro-qty">
                                    <span class="dec qtybtn" onclick="changeQty(-1,${product.quantity})">-</span>
                                    <input type="text" id="quantity" value="1">
                                    <span class="inc qtybtn" onclick="changeQty(1,${product.quantity})">+</span>
                                </div>
                            </div>
                        </div>
                        <a href="#" class="primary-btn" onclick="addToCart()">ADD TO CARD</a>
                        <a href="#" class="heart-icon"><span class="icon_heart_alt"></span></a>
                        <ul>
                            <li><b>Availability</b> <span>${product.quantity} In Stock</span></li>
                            <li><b>Shipping</b> <span>01 day shipping. <samp>Free pickup today</samp></span></li>
                            <li><b>Share on</b>
                                <div class="share">
                                    <a href="#"><i class="fa fa-facebook"></i></a>
                                    <a href="#"><i class="fa fa-twitter"></i></a>
                                    <a href="#"><i class="fa fa-instagram"></i></a>
                                    <a href="#"><i class="fa fa-pinterest"></i></a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
        `;
    }
}

function changeQty(number,productQty){
    const qtyInput = document.getElementById('quantity');
    let qty = parseInt(qtyInput.value) || 1;
    qty += number;
    if(qty < 1){
        qty = 1;
    }
    if(qty > productQty){
        qty = productQty;
        alert("Maximum quantity reached");
    }
    qtyInput.value = qty;
}

function checkJson(json) {
    if(typeof json === 'object' && json !== null && !Array.isArray(json)) {
        return true;
    }
    return false;
}

function checkProductId(){
    const productid = sessionStorage.getItem('productId');
    if (!productid || productid === "undefined" || productid === "null") {
        alert("Product ID is invalid.");
        return false;
    }
    return productid;
}

async function loadProductDetails(productid){
    console.log(`Loading product details for ID: ${productid}`);
    const response = await fetch(`http://localhost:4000/api/products/get/${productid}`)
    if(!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

async function addToCart(){
    if(sessionStorage.getItem('userId') === null) {
        alert("Please login to add products to the cart.");
        window.location.href = "login.html"; 
        return;
    }
    const quantity = document.getElementById('quantity').value;
    const productid = checkProductId();
    if(!productid) {
        alert("Product ID is invalid or not found.");
        window.location.href = "index.html"; 
        return;
    }
    const product = await loadProductDetails(productid);
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if(cart.some(item => item.productId === productid)) {
        console.log("Product already in cart, updating quantity.");
        cart.quantity += parseInt(quantity);
        cart.total += (product.price * (1 - product.discount / 100).toFixed(2));
        return;
    }
    cart.push({
        productId: productid,
        name: product.name,
        price: product.price,
        total: (product.price * (1 - product.discount / 100).toFixed(2)) * quantity,
        quantity: quantity,
        MaxQty: product.quantity,
        discount: product.discount,
        img: product.img
    });
    console.log("Adding product to cart:", product);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    console.log(sessionStorage.getItem('cart'));
    window.location.href = 'index.html'
}