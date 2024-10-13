let totalSeconds = 300; 

function updateTimer() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    if (totalSeconds > 0) {
        totalSeconds--;
    }
}

setInterval(updateTimer, 1000);
