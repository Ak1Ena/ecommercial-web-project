window.onload = () => {
    initCheckout();
    const submitOrder = document.getElementById('submitOrder');
    if (submitOrder) {
        submitOrder.addEventListener('click', submitOrderHandler);
    } else {
        console.warn('submitOrder button not found in the DOM.');
    }
};
async function initCheckout() {
    let userId = sessionStorage.getItem('userId');
    if (userId) {
        const { result, ok } = await getCart(userId);
        if (ok) {
            HTMLStrutureSLIP(result.cart);
        } else {
            alert('Failed to load cart');
        }
    } else {
        alert('Please login . . .');
        window.location.href = 'login.html';
    }
}

submitOrder.addEventListener('click', submitOrderHandler);

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

function HTMLStrutureSLIP(cart) {
    console.log("Cart received:", cart);
    const list_container = document.getElementById('cart-list');
    list_container.innerHTML = '';
    let total = 0;
    for (let item of cart) {
        list_container.innerHTML += `
            <li>${item.name} <span>$${item.total}</span></li>
        `;
        total += parseFloat(item.total);
    }
    updateTotalPrice(total);
}

function updateTotalPrice(amount){
    document.getElementById('total').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('subtotal').textContent = `$${amount.toFixed(2)}`;
}
async function submitOrderHandler() {
    let userID = sessionStorage.getItem('userId');
    
    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }
    const codCheckbox = document.getElementById('cod');
    
    if (!codCheckbox.checked) {
        alert("Please choose a payment method.");
        e.preventDefault(); // ป้องกันการดำเนินการต่อ (เช่นส่งฟอร์ม)
        return false;
    }
    try {
        // Get cart data
        const cartResponse = await getCart(userID);
        
        if (!cartResponse.ok) {
            alert('Failed to retrieve cart data.');
            return;
        }

        const items = cartResponse.result.cart; // Access the 'cart' property
        console.log('Cart items:', items);
        
        // Check if cart is empty
        if (!items || items.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        await fetch('http://localhost:4000/api/users/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                products: items,   // ส่งสินค้าทั้งหมดใน array เดียว
                id: userID
            })
        })
        .then(res => {
            if (!res.ok) {
                return res.text().then(errorText => {
                    throw new Error(`Checkout failed: ${res.status} - ${errorText}`);
                });
            }
            return res.json();
        })
        .then(data => {
            console.log("Checkout success:", data);
        })
        .catch(error => {
            console.error("Checkout error:", error.message);
        });
        
        await clearCartInDb(userID);
        
        alert('พัสดุกำลังถูกจัดส่ง กรุณารอสักครู่...');
        sessionStorage.removeItem('cart');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

async function clearCartInDb(userId) {
    try {
        const response = await fetch('http://localhost:4000/api/users/cart/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to clear cart: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Clear cart error:', error);
        throw error;
    }
}