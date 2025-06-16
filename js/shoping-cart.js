window.onload = initCart;

let total;

async function initCart() {
    document.getElementById('cart-items').innerHTML = ''; // Clear existing cart items
    const cart = await getCart();
    if (cart.length > 0) {
        HTMLStrutureCart(cart);
    }
}

function getCart() {
    console.log("Retrieving cart from sessionStorage");
    const data = JSON.parse(sessionStorage.getItem('cart')) || []
    console.log("Cart data:", data);
    return data;
}

function HTMLStrutureCart(cart) {
    total = 0; 
    const cartItemContainer = document.getElementById('cart-items');
    for (cartItem of cart) {
        const item = `
        <tr>
            <td class="shoping__cart__item">
                <img src="${cartItem.img}" alt="">
                <h5>${cartItem.name}</h5>
            </td>
            <td class="shoping__cart__price">
                ${cartItem.price}
            </td>
            <td class="shoping__cart__quantity">
                <div class="quantity">
                    <div class="pro-qty">
                        <span class="dec qtybtn" onclick="changeQty(-1,${cartItem.MaxQty},${cartItem.price}, this,${cartItem.productId})">-</span>
                        <input type="text" value="${cartItem.quantity}" readonly>
                        <span class="inc qtybtn" onclick="changeQty(1,${cartItem.MaxQty},${cartItem.price}, this,${cartItem.productId})">+</span>
                    </div>
                </div>
            </td>
            <td class="shoping__cart__total">
                $<span class="total-price">${cartItem.total}</span>
            </td>
            <td class="shoping__cart__item__close">
                <span class="icon_close" onclick="removeProduct(${cartItem.productId})"></span>
            </td>
        </tr>
                                    
        `
        total+= parseFloat(cartItem.total);
        cartItemContainer.innerHTML += item;
    }
    updateTotalPrice();
}

function removeProduct(productid){
    console.log(`Removing product with ID: ${productid}`);
    const cart = JSON.parse(sessionStorage.getItem('cart'));
const updatedCart = cart.filter(item => parseInt(item.productId) !== parseInt(productid));
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    console.log(JSON.parse(sessionStorage.getItem('cart')))
    initCart();
}

function changeQty(number, productQty, price, span, productId) {
    const row = span.closest('tr');
    const qtyInput = row.querySelector('input[type="text"]');
    let qty = parseInt(qtyInput.value) || 1;
    qty += number;

    if (qty < 1) qty = 1;
    if (qty > productQty) {
        qty = productQty;
        alert("Maximum quantity reached");
    }

    qtyInput.value = qty;
    const totalPriceSpan = row.querySelector('.total-price');
    const newTotal = (price * qty).toFixed(2);
    totalPriceSpan.textContent = newTotal;

    // อัปเดตใน sessionStorage ด้วย
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.map(item => {
        if (parseInt(item.productId) === parseInt(productId)) {
            item.quantity = qty;
            item.total = newTotal;
        }
        return item;
    });
    sessionStorage.setItem('cart', JSON.stringify(cart));

    // อัปเดตยอดรวมทั้งหมดใหม่
    recalcTotal();
}

function recalcTotal() {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    total = cart.reduce((sum, item) => sum + parseFloat(item.total), 0);
    updateTotalPrice();
}
function updateTotalPrice(){
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('subtotal').textContent = `$${total.toFixed(2)}`;
}