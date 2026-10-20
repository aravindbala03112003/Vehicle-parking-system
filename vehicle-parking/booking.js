// Check if there is a booked slot in local storage and update the UI accordingly
window.onload = function() {
  const bookedSlotId = localStorage.getItem('bookedSlot');
  if (bookedSlotId) {
    const bookedSlot = document.getElementById(bookedSlotId);
    bookedSlot.classList.add('red');
  }
};

function bookSlot(slotId) {
  const bookedSlot = document.getElementById(slotId);
  bookedSlot.classList.add('red');
}

function confirmBooking() {
  const selectedDate = new Date(document.getElementById('date').value);
  const currentDate = new Date();

  if (selectedDate <= currentDate) {
    alert('Selected date must be in the future.');
    return;
  }

  const bookedSlotId = document.querySelector('.red');
  if (!bookedSlotId) {
    alert('Please select a slot first.');
    return;
  }

  localStorage.setItem('bookedSlot', bookedSlotId.id);
  
  const timeDifference = selectedDate - currentDate;
  setTimeout(function() {
    bookedSlotId.classList.remove('red');
    localStorage.removeItem('bookedSlot');
  }, timeDifference);
}
