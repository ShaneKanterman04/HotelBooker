// Logic to display saved hotels
async function displaySavedHotels() {
    try {
        const response = await fetch('/api/user/favorites');
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            console.error('Error fetching saved hotels:', result.error);
            return;
        }

        const hotelListContainer = document.getElementById('hotelListContainer');
        hotelListContainer.innerHTML = ''; // Clear loading message

        if (result.hotels.length === 0) {
            hotelListContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">You haven\'t saved any hotels yet.</p>';
            return;
        }

        result.hotels.forEach(function(hotel) {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel-card';
            
            // Create star rating display
            const stars = '⭐'.repeat(hotel.star_rating || 0);

            // Since we are on the saved page, all these are favorites.
            // We can reuse the toggleFavorite function from main.js if we include main.js
            // But we need to handle the removal from the list visually.

            hotelCard.innerHTML = `
                <button class="favorite-btn favorited" onclick="removeFavorite(${hotel.id}, this)" title="Remove from favorites">
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
        console.error('Error displaying saved hotels:', error);
    }
}

async function removeFavorite(hotelId, btnElement) {
    if (!confirm('Remove this hotel from your saved list?')) return;

    try {
        const response = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hotel_id: hotelId })
        });

        if (response.ok) {
            // Remove the card from the DOM
            const card = btnElement.closest('.hotel-card');
            card.remove();
            
            // Check if list is empty
            const container = document.getElementById('hotelListContainer');
            if (container.children.length === 0) {
                container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">You haven\'t saved any hotels yet.</p>';
            }
        } else {
            alert('Failed to remove favorite');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
    }
}

// Call displaySavedHotels when page loads
document.addEventListener('DOMContentLoaded', displaySavedHotels);