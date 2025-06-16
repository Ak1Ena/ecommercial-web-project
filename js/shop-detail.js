
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
    HTMLStrutureRelate(product);
}
function getRandomItems(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
async function relatedProduct(product){
    try {
        const data = await loadProductCategory(product.category);
        const filtered = data.filter(p => p.id !== product.id);
        const maxCount = Math.min(4, filtered.length);
        const related = getRandomItems(filtered, maxCount);

        console.log("สินค้าแนะนำ:", related);
        return related;

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        return [];
    }
}

function HTMLStrutureRelate(product){
    console.log(product.category)
    const relatedContrainer = document.getElementById('related-product')
    relatedContrainer.innerHTML = '';
    relatedProduct(product)
    .then(related => {
        for(let item of related){
            relatedContrainer.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="product__item">
                        <div class="product__item__pic set-bg" data-setbg="${item.img}" style="background-image: url(${item.img})">
                            <ul class="product__item__pic__hover">
                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                <li><a href="#"><i class="fa fa-retweet"></i></a></li>
                                <li><a href="#"><i class="fa fa-shopping-cart"></i></a></li>
                            </ul>
                        </div>
                        <div class="product__item__text">
                            <h6><a href="#">${item.name}</a></h6>
                            <h5>$${item.price * (1 - item.discount / 100).toFixed(2)}</h5>
                        </div>
                    </div>
                </div>
            `
        }
    })
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

async function loadProductCategory(category){
    const response = await fetch(`http://localhost:4000/api/products/categories/${category}`)
    if(!response.ok){
        throw new Error("Network response was not ok")
    }
    return await response.json();
}
async function getCartFromBackend(userId) {
    try {
        const response = await fetch('http://localhost:4000/api/users/cart/get', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: userId })
        });
        if (!response.ok) throw new Error('Failed to fetch cart');
        const data = await response.json();
        // สมมติ backend ส่ง cart เป็น array หรือส่ง [] ถ้าไม่มีสินค้า
        return data.cart || [];
    } catch (error) {
        console.error('Error fetching cart:', error);
        return [];
    }
}

async function updateCartToBackend(userId, cart) {
    try {
        const response = await fetch('http://localhost:4000/api/users/cart/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: userId, cart: cart })
        });
        if (!response.ok) throw new Error('Failed to update cart');
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Error updating cart:', error);
        return false;
    }
}
async function addToCart() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert("Please login to add products to the cart.");
        window.location.href = "login.html";
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    const productid = checkProductId();
    if (!productid) {
        alert("Product ID is invalid or not found.");
        window.location.href = "index.html";
        return;
    }

    const product = await loadProductDetails(productid);

    let cart = await getCartFromBackend(userId);

    const existingIndex = cart.findIndex(item => item.productId === productid);
    const discountedPrice = product.price * (1 - product.discount / 100);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
        cart[existingIndex].total = parseFloat((discountedPrice * cart[existingIndex].quantity).toFixed(2));
    } else {
        cart.push({
            productId: productid,
            name: product.name,
            price: (product.price * (1 - product.discount / 100)).toFixed(2),
            total: parseFloat((discountedPrice * quantity).toFixed(2)),
            quantity: quantity,
            MaxQty: product.quantity,
            discount: product.discount,
            img: product.img
        });
    }

    const success = await updateCartToBackend(userId, cart);

    if(success) {
        alert("Added to cart successfully!");
        window.location.href = 'index.html';
    } else {
        alert("Failed to update cart. Please try again.");
    }
}