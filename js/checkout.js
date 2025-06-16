const submitOrder = document.getElementById('submit-order');

submitOrder.addEventListener('click', submitOrderHandler);

function submitOrderHandler() {
    let items = JSON.parse(sessionStorage.getItem('cart') || '[]');
    let userID = sessionStorage.getItem('userId');
    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }
    if(items.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    items.forEach(item => {
    fetch('http://localhost:4000/api/users/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        products: [item], 
        id: userID
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        alert('พัสดุกำลังถูกจัดส่ง กรุณารอสักครู่...')
        sessionStorage.removeItem('cart');
        window.location.href = 'index.html'
    })
    .catch(error => console.error('Error:', error));
    });

}