const submitOrder = document.getElementById('submit-order');

submitOrder.addEventListener('click', submitOrderHandler);

function submitOrderHandler() {
    console.log("test")
    let items = JSON.parse(localStorage.getItem('items') || '[]');
    let userID = localStorage.getItem('userID');
    // userID = 1 // For testing purposes, hardcoding userID to 1
    // items = [{id:1, name: 'Test Product', category: 'Fruit', quantity:10}]; // For testing purposes, hardcoding items
    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }
    if (!items || items === '[]') {
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
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
    });

}