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
            if (document.getElementById('savedBtn')) document.getElementById('savedBtn').style.display = 'block';
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
            if (document.getElementById('savedBtn')) document.getElementById('savedBtn').style.display = 'none';
            document.getElementById('loginBtn').style.display = 'block';
            document.getElementById('registerBtn').style.display = 'block';
            document.getElementById('portalBtn').style.display = 'none';
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
            window.location.reload();
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed');
    }
}

// Check auth when page loads, DOMContentLoaded ensures DOM is ready
document.addEventListener('DOMContentLoaded', checkAuth);


// Logic to display hotels on main page
async function displayHotels(city = '', minStars = '') {
    try {
        // Fetch hotels
        let url = '/api/hotels';
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (minStars) params.append('min_stars', minStars);
        
        if (params.toString()) url += '?' + params.toString();

        const [hotelsResponse, favoritesResponse] = await Promise.all([
            fetch(url),
            fetch('/api/favorites').catch(() => ({ ok: false })) // Ignore error if not logged in
        ]);

        const result = await hotelsResponse.json();
        let favorites = [];
        
        if (favoritesResponse.ok) {
            const favData = await favoritesResponse.json();
            favorites = favData.favorites || [];
        }

        if (!hotelsResponse.ok) {
            console.error('Error fetching hotels:', result.error);
            return;
        }

        const hotelListContainer = document.getElementById('hotelListContainer');
        hotelListContainer.innerHTML = ''; // Clear existing hotels

        if (result.hotels.length === 0) {
            hotelListContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No hotels found matching your criteria.</p>';
            return;
        }

        result.hotels.forEach(function(hotel) {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel-card';
            
            // Create star rating display
            const stars = '⭐'.repeat(hotel.star_rating || 0);
            const isFavorite = favorites.includes(hotel.id);
            const heartClass = isFavorite ? 'favorited' : '';

            hotelCard.innerHTML = `
                <button class="favorite-btn ${heartClass}" onclick="toggleFavorite(${hotel.id}, this)" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-heart"></i>
                </button>
                <h3>${hotel.hotel_name}</h3>
                <p class="stars">${stars}</p>
                <p class="location">📍 ${hotel.city}, ${hotel.country}</p>
                <a href="booking.html?id=${hotel.id}" class="view-hotel-btn">View Hotel</a>
            `;
            
            hotelListContainer.appendChild(hotelCard);
        });
    } catch (error) {
        console.error('Error displaying hotels:', error);
    }
}

async function toggleFavorite(hotelId, btnElement) {
    try {
        const response = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hotel_id: hotelId })
        });

        if (response.status === 401) {
            alert('Please login to save favorites');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        if (response.ok) {
            if (data.isFavorite) {
                btnElement.classList.add('favorited');
                btnElement.title = 'Remove from favorites';
            } else {
                btnElement.classList.remove('favorited');
                btnElement.title = 'Add to favorites';
            }
        } else {
            alert(data.error || 'Failed to update favorite');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

function searchHotels() {
    const city = document.getElementById('searchCity').value;
    const stars = document.getElementById('searchStars').value;
    displayHotels(city, stars);
    document.getElementById('hotelListContainer').scrollIntoView({ behavior: 'smooth' });
}

// Call displayHotels when page loads
document.addEventListener('DOMContentLoaded', () => displayHotels());