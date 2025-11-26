// Check if user is logged in on page load
async function checkAuth() {
  try {
    const response = await fetch('/api/check-auth');
    const session_data = await response.json();
    
    if (session_data.loggedIn) {
      // User is logged in, show user info and logout button
      document.getElementById('userName').textContent = session_data.user.name;
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'block';
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('registerBtn').style.display = 'none';
    } else {
      // User is logged out,show login and register buttons
      document.getElementById('userInfo').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'none';
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('registerBtn').style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

// Logout function
async function handleLogout(event) {
  event.preventDefault();
  try {
    const response = await fetch('/logout', { method: 'POST' });
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      window.location.reload(); // Refresh page to update UI
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed');
  }
}

// Check auth when page loads
checkAuth();