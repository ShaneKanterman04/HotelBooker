
function showMessage(msg, isError, formId) {
  var messageId = formId === 'hotelForm' ? 'hotelMessage' : 'roomMessage';
  var el = document.getElementById(messageId);
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? 'crimson' : 'green';
  el.style.display = 'block';
  el.style.padding = '10px';
  el.style.marginTop = '15px';
  el.style.border = '1px solid ' + (isError ? 'crimson' : 'green');
  el.style.borderRadius = '4px';
}

// ════════════════════════════════════════════
// Functions to show/hide portal views/forms
// ════════════════════════════════════════════
function showMenu() {
    // Show the main menu and hide both forms
    document.getElementById('menuView').style.display = 'block';
    document.getElementById('addHotelForm').style.display = 'none';
    document.getElementById('addRoomForm').style.display = 'none';
    document.getElementById('hotelManagementView').style.display = 'none';
}

function showAddHotelForm() {
    // Hide menu and show form to add hotel
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('addHotelForm').style.display = 'block';
    document.getElementById('addRoomForm').style.display = 'none';
}

function showAddRoomForm() {
    // Hide menu and show form to add room
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('addHotelForm').style.display = 'none';
    document.getElementById('addRoomForm').style.display = 'block';
    
    // Refresh hotel list every time form is opened
    populateHotelDropdown();
}

async function showHotelManagement() {
    const menuView = document.getElementById('menuView');
    const hotelManagementView = document.getElementById('hotelManagementView');
    const managementContainer = document.getElementById('managementContainer');
    managementContainer.innerHTML = ''; // Clear existing content

    // Hide menu and forms, show hotel management view
    if (menuView) menuView.style.display = 'none';
    if (hotelManagementView) hotelManagementView.style.display = 'block';

    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Load and display hotels and rooms with checkboxes
    try {
        const response = await fetch('/api/owner-hotels');
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error fetching your hotels');
            return;
        } else if (!result.myHotels || result.myHotels.length === 0) {
            alert('You have no hotels yet. Please add a hotel first.');
            showAddHotelForm();
            return;
        }
        
        // For each hotel, create a section where hotel and its rooms are listed with checkboxes
        result.myHotels.forEach(function(hotel) {
            // Create section where a hotel and its rooms will be listed
            const hotelSection = document.createElement('div');
            hotelSection.className = 'hotel-checkbox-section';
            hotelSection.style.marginBottom = '30px';
            hotelSection.style.paddingBottom = '20px';
            hotelSection.style.borderBottom = '1px solid var(--border)';
    
            // Create checkbox for hotel
            const hotelCheckbox = document.createElement('label');
            hotelCheckbox.className = 'checkbox-label';
            hotelCheckbox.style.fontSize = '18px';
            hotelCheckbox.style.fontWeight = '600';
            hotelCheckbox.style.marginBottom = '12px'; 
            hotelCheckbox.style.display = 'block'; 
            hotelCheckbox.innerHTML = `
                <input type="checkbox" class="hotel-checkbox" data-hotel-id="${hotel.id}" onchange="updateDeleteStats()">
                <span>${hotel.hotel_name} (${hotel.city}, ${hotel.country})</span>
            `;
            hotelSection.appendChild(hotelCheckbox);

            // Create roomsList section, append rooms checkboxes then add it to hotelSection
            if (hotel.rooms && hotel.rooms.length > 0) {
                const roomsList = document.createElement('div');
                roomsList.style.marginLeft = '32px';
                roomsList.style.display = 'flex';
                roomsList.style.flexDirection = 'column';
                roomsList.style.gap = '8px';
                
                hotel.rooms.forEach(function(room) {
                    const roomCheckbox = document.createElement('label');
                    roomCheckbox.className = 'checkbox-label';
                    roomCheckbox.style.fontSize = '14px';
                    roomCheckbox.innerHTML = `
                        <input type="checkbox" class="room-checkbox" data-room-id="${room.id}" data-hotel-id="${hotel.id}" onchange="updateDeleteStats()">
                        <span>Room ${room.room_number} - ${room.room_type} - $${room.price_per_night}/night</span>
                    `;
                    roomsList.appendChild(roomCheckbox);
                });
                hotelSection.appendChild(roomsList);

            } else {
                const noRooms = document.createElement('p');
                noRooms.style.marginLeft = '32px';
                noRooms.style.color = 'var(--muted)';
                noRooms.style.fontSize = '14px';
                noRooms.textContent = 'No rooms yet';
                hotelSection.appendChild(noRooms);
            }
            managementContainer.appendChild(hotelSection);
        });
        // Initialize stats
        updateDeleteStats();
        
    } catch (error) {
        console.error('Error loading hotel management:', error);
        alert('Error loading hotel management view');   
    }
}

// ════════════════════════════════════════════
// Form handling logic for add hotel and add room forms
// ════════════════════════════════════════════
async function handlePortalForm(formId, endpoint) {
    var form = document.getElementById(formId);
    if (!form) return "Form object not found";

    form.addEventListener("submit", async function(e) {
        e.preventDefault(); 

        // save form data
        var form_data = new FormData(form);
        var data = {};
        form_data.forEach(function(value, key) {data[key] = value;});
        
        // Convert checkbox to boolean instead of 'on' or undefined since database expects boolean, applies only to room form
        if (formId === 'roomForm')
            data.is_available = data.is_available === 'on';

        // send data to server at given endpoint
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            // parse server response
            const result = await response.json();

            // handle error responses
            if (!response.ok) {
                console.log('Error occurred:', result.error);
                showMessage(result.error || 'An error occurred', true, formId);
                return;
            }

            // show success message
            showMessage(result.message || 'Success', false, formId);
            form.reset(); 

        } catch(error) {
            console.error('Network error:', error);
            showMessage('ERROR: ' + error.message, true);
        }
    });
}

async function populateHotelDropdown() {
    // Populate hotel dropdown in add room form
    try {
        const response = await fetch('/api/owner-hotels');
        const result = await response.json();

        if (!response.ok) {
            console.error('Error fetching owner hotels:', result.error);
            return;
        }

        // Clear exsisting options, to avoid duplicates
        const hotelSelect = document.getElementById('hotelSelect');
        hotelSelect.innerHTML = '<option value="">Select a hotel</option>';
        
        // Loop through each hotel object and add each hotel as an option
        result.myHotels.forEach(function(hotel) {
            const option = document.createElement('option');
            // When the user selects a hotel, the value will be the hotel ID
            option.value = hotel.id;
            option.textContent = hotel.hotel_name;
            hotelSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching owner hotels:', error);
    }
}

handlePortalForm('hotelForm', '/api/add-hotel');
handlePortalForm('roomForm', '/api/add-room');

// ════════════════════════════════════════════
// Logic to remove selected hotels and rooms
// ════════════════════════════════════════════
function updateDeleteStats() {
    // Function to update counter for selected hotels and rooms
    const selectedHotels = document.querySelectorAll('.hotel-checkbox:checked');
    const selectedRooms = document.querySelectorAll('.room-checkbox:checked');
    
    document.getElementById('selectedHotelsCount').textContent = selectedHotels.length;
    document.getElementById('selectedRoomsCount').textContent = selectedRooms.length;
    
    const deleteBtn = document.getElementById('bulkDeleteBtn');
    deleteBtn.disabled = selectedHotels.length === 0 && selectedRooms.length === 0;
}

function toggleSelectAll(type) {
    // Function to toggle select all checkboxes for hotels or rooms
    if (type === 'hotel') {
        const selectAllCheckbox = document.getElementById('selectAllHotels');
        const hotelCheckboxes = document.querySelectorAll('.hotel-checkbox');
        hotelCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    } else if (type === 'room') {
        const selectAllCheckbox = document.getElementById('selectAllRooms');
        const roomCheckboxes = document.querySelectorAll('.room-checkbox');
        roomCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    }
    updateDeleteStats();
}

async function processDeleteRequest() {
    const selectedHotels = Array.from(document.querySelectorAll('.hotel-checkbox:checked'))
        .map(cb => parseInt(cb.dataset.hotelId));
    const selectedRooms = Array.from(document.querySelectorAll('.room-checkbox:checked'))
        .map(cb => parseInt(cb.dataset.roomId));
    
    if (selectedHotels.length === 0 && selectedRooms.length === 0) {
        alert('Please select at least one item to delete');
        return;
    }
    
    const confirmMsg = `Are you sure you want to delete ${selectedHotels.length} hotel(s) and ${selectedRooms.length} room(s)? This cannot be undone.`;
    if (!confirm(confirmMsg)) {
        return;
    }
    
    const messageEl = document.getElementById('deleteMessage');
    messageEl.innerHTML = '<p style="color: var(--accent);">Deleting...</p>';
    
    try {
        const response = await fetch('/api/delete-requests', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ hotelIds: selectedHotels, roomIds: selectedRooms })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            console.log('Error during bulk delete:', result.error);
            messageEl.innerHTML = `<p>Error: ${result.error || 'Bulk delete failed'}</p>`;
            return;
        }
        messageEl.innerHTML = `<p>${result.message}</p>`;
        
        // Reload the management view
        setTimeout(() => {
            showHotelManagement();
            messageEl.innerHTML = '';
        }, 1500);
        
    } catch (error) {
        console.error('Delete error:', error);
        messageEl.innerHTML = `<p style="color: red; padding: 12px; background: #f8d7da; border-radius: 8px;">Error: ${error.message}</p>`;
    }
}