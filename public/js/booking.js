// Get hotel ID from URL
const urlParams = new URLSearchParams(window.location.search);
const hotelId = urlParams.get('id');

let currentHotel = null;
let selectedRoomPrice = 0;

// Load hotel and rooms on page load
document.addEventListener('DOMContentLoaded', loadHotelAndRooms);

async function loadHotelAndRooms() {
    if (!hotelId) {
        alert('No hotel selected');
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`/api/hotel/${hotelId}`);
        const result = await response.json();

        if (!response.ok) {
            console.error('Server error:', result.error);
            alert('Error loading hotel: ' + (result.error));
            window.location.href = '/';
            return;
        }

        currentHotel = result.hotel;
        displayHotelInfo(currentHotel);
        displayRooms(currentHotel.rooms);
        populateRoomSelect(currentHotel.rooms);

    } catch (error) {
        console.error('Error loading hotel:', error);
        alert('Failed to load hotel information: ' + error.message);
    }
}

function displayHotelInfo(hotel) {
    document.getElementById('hotelName').textContent = hotel.hotel_name;
    
    const stars = '⭐'.repeat(hotel.star_rating || 0);
    document.getElementById('hotelInfo').innerHTML = `
        <p>${stars}</p>
        <p>📍 ${hotel.address}, ${hotel.city}, ${hotel.state}, ${hotel.country}</p>
        <p>${hotel.description}</p>
    `;
}

function displayRooms(rooms) {
    const roomsContainer = document.getElementById('roomsContainer');
    roomsContainer.innerHTML = '';

    if (!rooms || rooms.length === 0) {
        roomsContainer.innerHTML = '<p style="color: var(--muted);">No rooms available at this hotel.</p>';
        return;
    }

    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        const availabilityClass = room.availability ? 'available' : 'unavailable';
        const availabilityText = room.availability ? '✅ Available' : '❌ Not Available';

        roomCard.innerHTML = `
            <h3>Room ${room.room_number}</h3>
            <p class="price">$${room.price_per_night}<span style="font-size: 14px; font-weight: normal;">/night</span></p>
            <div class="details">
                <p>🛏️ Bed: ${room.bed_type}</p>
                <p>👥 Capacity: ${room.capacity} guest(s)</p>
            </div>
            <p>${room.description}</p>
            <div class="amenities">
                <strong>Amenities:</strong> ${room.amenities}
            </div>
            <span class="availability ${availabilityClass}">${availabilityText}</span>
        `;
        roomsContainer.appendChild(roomCard);
    });
}

function populateRoomSelect(rooms) {
    const roomSelect = document.getElementById('roomSelect');
    roomSelect.innerHTML = '<option value="">Choose a room</option>';

    if (!rooms || rooms.length === 0) return;

    rooms.forEach(room => {
        if (room.availability) {
            const option = document.createElement('option');
            option.value = room.id;
            option.dataset.price = room.price_per_night;
            option.textContent = `Room ${room.room_number} - ${room.room_type} - $${room.price_per_night}/night`;
            roomSelect.appendChild(option);
        }
    });
}

// Update price when room or dates change
document.getElementById('roomSelect').addEventListener('change', calculateTotal);
document.getElementById('checkIn').addEventListener('change', calculateTotal);
document.getElementById('checkOut').addEventListener('change', calculateTotal);

function calculateTotal() {
    const roomSelect = document.getElementById('roomSelect');
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (!roomSelect.value || !checkIn || !checkOut) {
        document.getElementById('totalPrice').textContent = '$0';
        document.getElementById('nightsCount').textContent = '';
        return;
    }

    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    selectedRoomPrice = parseFloat(selectedOption.dataset.price);

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        document.getElementById('totalPrice').textContent = '$0';
        document.getElementById('nightsCount').textContent = 'Invalid dates';
        return;
    }

    const total = selectedRoomPrice * nights;
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
    document.getElementById('nightsCount').textContent = `${nights} night(s) × $${selectedRoomPrice}/night`;
}

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('checkIn').setAttribute('min', today);
document.getElementById('checkOut').setAttribute('min', today);

// Handle booking form submission
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const bookingData = {
        room_id: formData.get('room_id'),
        check_in: formData.get('check_in'),
        check_out: formData.get('check_out')
    };

    // Validate dates
    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    
    if (checkOut <= checkIn) {
        showMessage('Check-out date must be after check-in date', true);
        return;
    }

    try {
        const response = await fetch('/api/book-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || 'Booking failed', true);
            return;
        }

        showMessage(result.message || 'Booking successful!', false);
        e.target.reset();
        document.getElementById('totalPrice').textContent = '$0';
        document.getElementById('nightsCount').textContent = '';

    } catch (error) {
        console.error('Booking error:', error);
        showMessage('Network error. Please try again.', true);
    }
});

function showMessage(msg, isError) {
    const messageEl = document.getElementById('bookingMessage');
    messageEl.textContent = msg;
    messageEl.className = isError ? 'error' : 'success';
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}
