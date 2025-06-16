window.onload = initCart;

let total;

async function initCart() {
    if(!sessionStorage.getItem('userId')){
        alert('Please login . . .')
        window.location.href = 'login.html'
        return;
    }
    document.getElementById('cart-items').innerHTML = ''; // Clear existing cart items
    const userId = sessionStorage.getItem('userId');
    const { result, ok } = await getCart(userId);
    if (ok && Array.isArray(result.cart) && result.cart.length > 0) {
        HTMLStrutureCart(result.cart);
    } else {
        updateTotalPrice(0);
        document.getElementById('cart-items').innerHTML = '<tr><td colspan="5">Cart is empty.</td></tr>';
    }
}

// ดึง cart จาก backend
async function getCart(userId) {
    try {
        const response = await fetch('http://localhost:4000/api/users/cart/get', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: userId })
        });
        const result = await response.json();
        return { result, ok: response.ok };
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { result: null, ok: false };
    }
}

function HTMLStrutureCart(cart) {
    total = 0; 
    const cartItemContainer = document.getElementById('cart-items');
    cartItemContainer.innerHTML = '';
    for (const cartItem of cart) {
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
        `;
        total += parseFloat(cartItem.total);
        cartItemContainer.innerHTML += item;
    }
    updateTotalPrice(total);
}

// ลบสินค้าและอัปเดต backend
async function removeProduct(productid){
    const userId = sessionStorage.getItem('userId');
    if (!userId) return alert('Please login first.');

    try {
        const { result, ok } = await getCart(userId);
        if (!ok) throw new Error('Failed to get cart');

        let cart = result.cart || [];
        cart = cart.filter(item => parseInt(item.productId) !== parseInt(productid));

        const success = await updateCart(userId, cart);
        if(success) {
            initCart();
        } else {
            alert('Failed to update cart');
        }
    } catch (error) {
        console.error(error);
        alert('Error removing product');
    }
}

// เปลี่ยนจำนวนสินค้าและอัปเดต backend
async function changeQty(number, productQty, price, span, productId) {
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

    const userId = sessionStorage.getItem('userId');
    if (!userId) return alert('Please login first.');

    try {
        const { result, ok } = await getCart(userId);
        if (!ok) throw new Error('Failed to get cart');

        let cart = result.cart || [];
        cart = cart.map(item => {
            if (parseInt(item.productId) === parseInt(productId)) {
                item.quantity = qty;
                item.total = newTotal;
            }
            return item;
        });

        const success = await updateCart(userId, cart);
        if(success) {
            recalcTotal(cart);
        } else {
            alert('Failed to update cart');
        }
    } catch (error) {
        console.error(error);
    }
}

// อัปเดต cart ที่ backend
async function updateCart(userId, cart) {
    try {
        const response = await fetch('http://localhost:4000/api/users/cart/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: userId, cart: cart })
        });
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Error updating cart:', error);
        return false;
    }
}

function recalcTotal(cart) {
    total = cart.reduce((sum, item) => sum + parseFloat(item.total), 0);
    updateTotalPrice(total);
}

function updateTotalPrice(amount){
    document.getElementById('total').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('subtotal').textContent = `$${amount.toFixed(2)}`;
}
