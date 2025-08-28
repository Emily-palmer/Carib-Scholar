document.addEventListener('DOMContentLoaded', () => {
    const subjectCards = document.querySelectorAll('.subject-card');

    subjectCards.forEach(card => {
        const dropdown = card.querySelector('.paper-dropdown');
        
        card.addEventListener('mouseenter', () => {
            dropdown.classList.add('visible');
        });

        card.addEventListener('mouseleave', () => {
            dropdown.classList.remove('visible');
        });
    });
});