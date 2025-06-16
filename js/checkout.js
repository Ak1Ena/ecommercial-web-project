const submitOrder = document.getElementById('submit-order');

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

async function submitOrderHandler() {
    let userID = sessionStorage.getItem('userId');
    
    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
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

        // Process each item individually (as your original code intended)
        const checkoutPromises = items.map(item => {
            return fetch('http://localhost:4000/api/users/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: [item],  // Single item in array
                    id: userID
                })
            })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(errorText => {
                        throw new Error(`Checkout failed for item: ${res.status} - ${errorText}`);
                    });
                }
                return res.json();
            });
        });

        // Wait for all checkout requests to complete
        await Promise.all(checkoutPromises);
        
        // Clear cart after all successful checkouts
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