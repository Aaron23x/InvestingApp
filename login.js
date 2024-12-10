function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login request to the server
    fetch('/api/login', {  // Use the relative path since Vercel handles the full URL for you
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                console.log('Login successful! Token:', data.token);
                localStorage.setItem('username', data.username);
                window.location.href = 'portfolio.html';
            } else {
                alert(data.error || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        });
}
