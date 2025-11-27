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
        
        // Show portal button for owners
        if (session_data.user.userType === 'owner') {
            document.getElementById('portalBtn').style.display = 'block';
        } 
        } else {
        // User is logged out, show only login and register buttons
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'block';
        document.getElementById('portalBtn').style.display = 'none';
        }
    } catch (error) {console.error('Error checking auth:', error);}
}


// Check auth when page loads, DOMContentLoaded ensures DOM is ready
document.addEventListener('DOMContentLoaded', checkAuth);