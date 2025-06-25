document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const FirstName = document.getElementById('firstName').value.trim();
    const LastName = document.getElementById('lastName').value.trim();
    const Email = document.getElementById('email').value.trim();
    const Password = document.getElementById('password').value;
    const PhoneNumber = document.getElementById('phone').value.trim();
    const Address = document.getElementById('address').value.trim();

    const userData = {
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        Address,
        Password
    };

    try {
        const response = await fetch('http://localhost:4000/api/users/register', { // 🔁 เปลี่ยนเป็น URL backend ของคุณ
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Registration successful!');
            window.location.href = 'login.html'; 
        } else {
            alert(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
});
