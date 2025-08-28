document.addEventListener('DOMContentLoaded', () => {
    // Fullscreen functionality
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const paperContainer = document.querySelector('.paper-container');
    
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            paperContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Full Screen';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Full Screen';
            }
        }
    });
    
    // Timer functionality
    const timer = document.getElementById('timer');
    let timeLeft = 90 * 60; // 90 minutes in seconds
    let timerInterval;
    
    const startTimer = () => {
        timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitAnswers();
                return;
            }
            
            timeLeft--;
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    };
    
    startTimer();
    
    // Submit functionality
    const submitBtn = document.getElementById('submit-btn');
    
    const submitAnswers = () => {
        clearInterval(timerInterval);
        
        // Collect answers
        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers[input.name] = input.value;
        });
        
        // Save to local storage
        localStorage.setItem('english_jan2021_p1_answers', JSON.stringify(answers));
        localStorage.setItem('english_jan2021_p1_time', timeLeft);
        
        // Redirect to results page
        window.location.href = '/results.html';
    };
    
    submitBtn.addEventListener('click', submitAnswers);
    
    // Auto-save progress
    setInterval(() => {
        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers[input.name] = input.value;
        });
        
        localStorage.setItem('english_jan2021_p1_progress', JSON.stringify({
            answers: answers,
            timeLeft: timeLeft
        }));
    }, 30000);
    
    // Load saved progress
    const savedProgress = localStorage.getItem('english_jan2021_p1_progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        // Restore answers
        Object.entries(progress.answers).forEach(([name, value]) => {
            const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (input) input.checked = true;
        });
        
        // Restore timer
        if (progress.timeLeft) {
            timeLeft = progress.timeLeft;
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
});
