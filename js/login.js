document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const userData = {
        email: username,
        password: password
    };

    try {
        const response = await fetch('http://localhost:4000/api/users/login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Login successful');
            sessionStorage.setItem('userId', result.user.id);
            sessionStorage.setItem('username',result.user.firstName)
            console.log(sessionStorage.getItem('username'))
            window.location.href = 'index.html';
        } else {
            alert(result.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Something went wrong. Please try again.');
    }
});
