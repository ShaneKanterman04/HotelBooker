

function showMenu() {
    // Show the main menu and hide both forms
    document.getElementById('menuView').style.display = 'block';
    document.getElementById('addHotelForm').style.display = 'none';
    document.getElementById('addRoomForm').style.display = 'none';
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


// Form handling logic, sends data to server and shows message
function showMessage(msg, isError) {
  var el = document.getElementById('message');
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? 'crimson' : 'green';
  el.style.display = 'block';
  el.style.padding = '10px';
  el.style.marginTop = '15px';
  el.style.border = '1px solid ' + (isError ? 'crimson' : 'green');
  el.style.borderRadius = '4px';
}

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
                showMessage(result.error || 'An error occurred', true);
                return;
            }

            // show success message
            showMessage(result.message || 'Success', false);
            form.reset(); 

        } catch(error) {
            console.error('Network error:', error);
            showMessage('ERROR: ' + error.message, true);
        }
    });
}

handlePortalForm('hotelForm', '/api/add-hotel');
handlePortalForm('roomForm', '/api/add-room');

// Populate hotel dropdown in add room form
async function populateHotelDropdown() {
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
            option.value = hotel.id;
            option.textContent = hotel.hotel_name;
            hotelSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching owner hotels:', error);
    }
}