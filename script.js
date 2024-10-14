    // Countdown Timer Logic
    const targetDate = new Date('2025-03-16T12:30:00');

    function updateTimer() {
      const currentDate = new Date();
      const totalMilliseconds = targetDate - currentDate;

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
console.log('Script is running');

    // Button Selection Logic
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('.btn');
    
      buttons.forEach(button => {
        button.addEventListener('click', function() {
          // Remove 'select' class from all buttons
          buttons.forEach(btn => btn.classList.remove('select'));
          
          // Add 'select' class to the clicked button
          this.classList.add('select');
          console.log('Button clicked:', this.textContent); // Debugging log
        });
      });
    });