

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
}