import { db, doc, getDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('paperId');

    if (!paperId) {
        document.getElementById('exam-container').innerHTML = '<p>Please select a paper from the <a href="/exam">Exams page</a>.</p>';
        return;
    }

    try {
        const paperDocRef = doc(db, 'papers', paperId);
        const docSnap = await getDoc(paperDocRef);

        if (!docSnap.exists()) {
            throw new Error('Paper not found.');
        }

        const paperData = docSnap.data();
        document.getElementById('exam-title').textContent = `${paperData.subject} ${paperData.year} - Paper ${paperData.paperNumber}`;
        const questionsList = document.getElementById('questions-list');
        
        paperData.questions.forEach((q, index) => {
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card';
            
            let questionContent = `<div class="question-header"><h4>Question ${index + 1}</h4></div>`;
            questionContent += `<div class="question-body">`;
            questionContent += `<p>${q.text}</p>`;

            if (q.type === 'multiple-choice') {
                questionContent += `<ul class="options-list">`;
                q.options.forEach(option => {
                    questionContent += `<li><input type="radio" name="q${q.id}" value="${option}" id="q${q.id}-${option.replace(/\s/g, '-')}" class="option-input"><label for="q${q.id}-${option.replace(/\s/g, '-')}" class="option-label">${option}</label></li>`;
                });
                questionContent += `</ul>`;
            } else if (q.type === 'essay') {
                questionContent += `<textarea data-question-id="${q.id}" placeholder="${q.placeholder}" rows="10"></textarea>`;
            }
            questionContent += `</div>`;
            questionCard.innerHTML = questionContent;
            questionsList.appendChild(questionCard);
        });

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.addEventListener('click', async () => {
            const userAnswers = {};
            paperData.questions.forEach(q => {
                if (q.type === 'multiple-choice') {
                    const selectedOption = document.querySelector(`input[name="q${q.id}"]:checked`);
                    userAnswers[q.id] = selectedOption ? selectedOption.value : '';
                } else if (q.type === 'essay') {
                    const textarea = document.querySelector(`textarea[data-question-id="${q.id}"]`);
                    userAnswers[q.id] = textarea ? textarea.value : '';
                }
            });

            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                // Here, you would call a cloud function to submit the answers for marking.
                // For now, we will log the answers to the console to confirm they are collected.
                console.log("Answers submitted:", userAnswers);
                alert("Paper submitted. Please check the console for a log of your answers.");
            } catch (error) {
                console.error("Error marking paper:", error);
                alert("An error occurred while marking your paper.");
            } finally {
                submitBtn.textContent = 'Submit for Marking';
                submitBtn.disabled = false;
            }
        });

    } catch (error) {
        console.error("Error loading exam:", error);
        document.getElementById('exam-container').innerHTML = `<p>${error.message}</p>`;
    }
});