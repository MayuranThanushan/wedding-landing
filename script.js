// Countdown Timer Logic
const targetDate = new Date(Date.UTC(2025, 2, 16, 1, 0, 0));

function updateTimer() {
  const currentDate = new Date();
  const currentUTCDate = new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000); // Convert to UTC

  const totalMilliseconds = targetDate - currentUTCDate;

  if (totalMilliseconds >= 0) {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  } else {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
  }
}

updateTimer();
setInterval(updateTimer, 1000);