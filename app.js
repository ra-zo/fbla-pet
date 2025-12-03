let pet = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const createPetBtn = document.getElementById('createPetBtn');
    createPetBtn.addEventListener('click', createPet);
    
    // Make updatePetDisplay available globally
    window.updatePetDisplay = updatePetDisplay;
    
    // Initialize Q&A buttons (available before pet creation)
    const startQABtn = document.getElementById('startQABtn');
    const closeQABtn = document.getElementById('closeQABtn');
    const qaNextBtn = document.getElementById('qaNextBtn');
    
    if (startQABtn) startQABtn.addEventListener('click', startQA);
    if (closeQABtn) closeQABtn.addEventListener('click', closeQA);
    if (qaNextBtn) qaNextBtn.addEventListener('click', nextQuestion);
    
    // Initialize Help menu
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const closeHelpBtn2 = document.getElementById('closeHelpBtn2');
    const helpModal = document.getElementById('helpModal');
    
    if (helpBtn) helpBtn.addEventListener('click', openHelp);
    if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelp);
    if (closeHelpBtn2) closeHelpBtn2.addEventListener('click', closeHelp);
    
    // Close help modal when clicking outside
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeHelp();
            }
        });
    }
});

function createPet() {
    const name = document.getElementById('petName').value.trim();
    const type = document.getElementById('petType').value;
    const budget = parseFloat(document.getElementById('startingBudget').value);
    
    if (!name) {
        showMessage('Please enter a pet name!', 'error');
        return;
    }
    
    if (budget < 50 || budget > 500) {
        showMessage('Budget must be between $50 and $500!', 'error');
        return;
    }
    
    pet = new VirtualPet(name, type, budget);
    
    // Hide setup modal, show game area
    document.getElementById('setupModal').classList.add('hidden');
    document.getElementById('gameArea').classList.remove('hidden');
    
    // Setup action buttons
    setupActionButtons();
    
    // Initial display update
    updatePetDisplay();
    
    showMessage(`Welcome ${name}! Take good care of your pet!`, 'success');
}

function setupActionButtons() {
    // Care actions
    document.getElementById('feedBtn').addEventListener('click', () => performAction('feed'));
    document.getElementById('playBtn').addEventListener('click', () => performAction('play'));
    document.getElementById('restBtn').addEventListener('click', () => performAction('rest'));
    document.getElementById('cleanBtn').addEventListener('click', () => performAction('clean'));
    document.getElementById('healthCheckBtn').addEventListener('click', () => performAction('healthCheck'));
    document.getElementById('toyBtn').addEventListener('click', () => performAction('buyToy'));
    
    // Chores
    document.getElementById('chore1Btn').addEventListener('click', () => performChore('study'));
    document.getElementById('chore2Btn').addEventListener('click', () => performChore('cleanRoom'));
    document.getElementById('chore3Btn').addEventListener('click', () => performChore('waterPlants'));
    document.getElementById('chore4Btn').addEventListener('click', () => performChore('homework'));
    
    // Savings goal
    document.getElementById('setGoalBtn').addEventListener('click', setSavingsGoal);
}

function performAction(action) {
    if (!pet) return;
    
    let result;
    switch(action) {
        case 'feed':
            result = pet.feed();
            break;
        case 'play':
            result = pet.play();
            break;
        case 'rest':
            result = pet.rest();
            break;
        case 'clean':
            result = pet.clean();
            break;
        case 'healthCheck':
            result = pet.healthCheck();
            break;
        case 'buyToy':
            result = pet.buyToy();
            break;
    }
    
    if (result) {
        if (result.success) {
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
        updatePetDisplay();
    }
}

function performChore(choreType) {
    if (!pet) return;
    
    const result = pet.doChore(choreType);
    if (result.success) {
        showMessage(result.message, 'success');
    } else {
        showMessage(result.message, 'error');
    }
    updatePetDisplay();
}

function setSavingsGoal() {
    if (!pet) return;
    
    const amount = parseFloat(document.getElementById('goalAmount').value);
    if (isNaN(amount)) {
        showMessage('Please enter a valid amount!', 'error');
        return;
    }
    
    const result = pet.setSavingsGoal(amount);
    if (result.success) {
        showMessage(result.message, 'success');
        document.getElementById('goalAmount').value = '';
        updatePetDisplay();
    } else {
        showMessage(result.message, 'error');
    }
}

function updatePetDisplay() {
    if (!pet) return;
    
    // Update pet video (video is already set in HTML, just ensure it's playing)
    const petVideo = document.getElementById('petVideo');
    if (petVideo && petVideo.paused) {
        petVideo.play().catch(e => console.log('Video autoplay prevented:', e));
    }
    document.getElementById('petNameDisplay').textContent = pet.name;
    
    // Update mood
    const mood = pet.getMood();
    const moodElement = document.getElementById('petMood');
    moodElement.textContent = mood.text;
    moodElement.className = 'pet-mood ' + mood.class;
    
    // Update stats
    updateStatBar('hunger', pet.hunger);
    updateStatBar('happiness', pet.happiness);
    updateStatBar('health', pet.health);
    updateStatBar('energy', pet.energy);
    
    // Update budget
    document.getElementById('availableBudget').textContent = `$${pet.budget.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `$${pet.totalSpent.toFixed(2)}`;
    document.getElementById('savingsGoal').textContent = `$${pet.savingsGoal.toFixed(2)}`;
    
    // Update expense list
    updateExpenseList();
    
    // Update savings progress
    updateSavingsProgress();
    
    // Update button states
    updateButtonStates();
}

function updateStatBar(statName, value) {
    const bar = document.getElementById(statName + 'Bar');
    const valueElement = document.getElementById(statName + 'Value');
    
    if (bar && valueElement) {
        bar.style.width = value + '%';
        valueElement.textContent = Math.round(value) + '%';
        
        // Change color based on value
        if (value > 70) {
            bar.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        } else if (value > 40) {
            bar.style.background = 'linear-gradient(90deg, #ffc107, #ff9800)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
        }
    }
}

function updateExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    
    if (pet.expenses.length === 0) {
        expenseList.innerHTML = '<div class="expense-item">No expenses yet</div>';
        return;
    }
    
    // Show last 10 expenses
    const recentExpenses = pet.expenses.slice(-10).reverse();
    recentExpenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <span>${expense.category}</span>
            <span>$${expense.amount.toFixed(2)}</span>
        `;
        expenseList.appendChild(item);
    });
}

function updateSavingsProgress() {
    const progress = pet.getSavingsProgress();
    const progressBar = document.getElementById('goalProgress');
    const progressFill = document.getElementById('goalProgressBar');
    const progressText = document.getElementById('goalProgressText');
    
    if (pet.savingsGoal > 0) {
        progressBar.classList.remove('hidden');
        progressFill.style.width = progress + '%';
        progressText.textContent = `${Math.round(progress)}% ($${pet.budget.toFixed(2)} / $${pet.savingsGoal.toFixed(2)})`;
    } else {
        progressBar.classList.add('hidden');
    }
}

function updateButtonStates() {
    const actions = [
        { btn: 'feedBtn', cost: pet.costs.feed },
        { btn: 'playBtn', cost: pet.costs.play },
        { btn: 'cleanBtn', cost: pet.costs.clean },
        { btn: 'healthCheckBtn', cost: pet.costs.healthCheck },
        { btn: 'toyBtn', cost: pet.costs.toy }
    ];
    
    actions.forEach(action => {
        const btn = document.getElementById(action.btn);
        if (btn) {
            btn.disabled = pet.budget < action.cost;
        }
    });
}

function showMessage(message, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageArea.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    messageArea.scrollTop = messageArea.scrollHeight;
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Q&A System
let qaState = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    answered: false
};

const qaQuestions = [
    {
        question: "How often should you take your pet for a health check-up?",
        options: ["Once a year", "Every 6 months", "Only when sick", "Never needed"],
        correct: 0,
        explanation: "Regular annual check-ups help prevent health issues and catch problems early!"
    },
    {
        question: "What is the best way to save money for pet expenses?",
        options: ["Spend everything immediately", "Set a savings goal and stick to it", "Only buy when you have extra money", "Never save, just spend"],
        correct: 1,
        explanation: "Setting savings goals helps you prepare for unexpected pet expenses!"
    },
    {
        question: "Why is it important to feed your pet regularly?",
        options: ["It's not important", "Pets need consistent nutrition for health", "Only feed when they ask", "Pets don't need food"],
        correct: 1,
        explanation: "Regular feeding keeps your pet healthy and maintains their energy levels!"
    },
    {
        question: "What should you do if your pet's health drops below 30%?",
        options: ["Ignore it", "Take them for a health check immediately", "Wait and see", "Feed them more"],
        correct: 1,
        explanation: "Low health requires immediate attention - a health check can help identify and fix problems!"
    },
    {
        question: "How can you earn money to care for your pet?",
        options: ["Only by spending", "By doing chores and tasks", "Money appears automatically", "You can't earn money"],
        correct: 1,
        explanation: "Completing chores like studying, cleaning, and homework helps you earn money for pet care!"
    },
    {
        question: "What happens if your pet's happiness is very low?",
        options: ["Nothing", "Pet becomes sad and may affect health", "Pet gets happier automatically", "You get more money"],
        correct: 1,
        explanation: "Low happiness can affect your pet's overall well-being - play with them and keep them happy!"
    },
    {
        question: "Why should you set a savings goal?",
        options: ["It's not necessary", "It helps track progress and motivates saving", "It costs money", "It's too complicated"],
        correct: 1,
        explanation: "Savings goals help you plan for future expenses and teach good financial habits!"
    },
    {
        question: "What is the most cost-effective way to restore your pet's energy?",
        options: ["Buy expensive toys", "Let them rest (it's free!)", "Feed them constantly", "Ignore energy levels"],
        correct: 1,
        explanation: "Resting is free and effective - it's a great way to restore energy without spending money!"
    }
];

function startQA() {
    if (!pet) {
        showMessage('Please create a pet first!', 'error');
        return;
    }
    
    // Shuffle questions and take 5 random ones
    const shuffled = [...qaQuestions].sort(() => Math.random() - 0.5);
    qaState.questions = shuffled.slice(0, 5);
    qaState.currentQuestion = 0;
    qaState.score = 0;
    qaState.answered = false;
    
    // Reset next button
    const qaNextBtn = document.getElementById('qaNextBtn');
    qaNextBtn.textContent = 'Next Question';
    qaNextBtn.onclick = nextQuestion;
    
    // Show modal
    document.getElementById('qaModal').classList.remove('hidden');
    
    // Display first question
    displayQuestion();
}

function closeQA() {
    document.getElementById('qaModal').classList.add('hidden');
    qaState.answered = false;
}

function displayQuestion() {
    if (qaState.currentQuestion >= qaState.questions.length) {
        endQA();
        return;
    }
    
    const question = qaState.questions[qaState.currentQuestion];
    const questionNum = qaState.currentQuestion + 1;
    const totalQuestions = qaState.questions.length;
    
    // Update question number
    document.getElementById('qaQuestionNumber').textContent = `Question ${questionNum} of ${totalQuestions}`;
    
    // Update question text
    document.getElementById('qaQuestion').textContent = question.question;
    
    // Clear and populate options
    const optionsContainer = document.getElementById('qaOptions');
    optionsContainer.innerHTML = '';
    optionsContainer.classList.remove('disabled');
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'qa-option-btn';
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Hide feedback and next button
    document.getElementById('qaFeedback').classList.add('hidden');
    document.getElementById('qaNextBtn').classList.add('hidden');
    qaState.answered = false;
    
    // Update score display
    updateQAScore();
}

function selectAnswer(selectedIndex) {
    if (qaState.answered) return;
    
    qaState.answered = true;
    const question = qaState.questions[qaState.currentQuestion];
    const options = document.querySelectorAll('.qa-option-btn');
    const feedback = document.getElementById('qaFeedback');
    
    // Disable all options
    document.getElementById('qaOptions').classList.add('disabled');
    options.forEach(btn => btn.disabled = true);
    
    // Mark correct and incorrect answers
    options.forEach((btn, index) => {
        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            btn.classList.add('incorrect');
        }
    });
    
    // Show feedback
    if (selectedIndex === question.correct) {
        qaState.score++;
        feedback.className = 'qa-feedback correct';
        feedback.innerHTML = `<strong>✓ Correct!</strong><br>${question.explanation}`;
        
        // Reward for correct answer
        rewardCorrectAnswer();
    } else {
        feedback.className = 'qa-feedback incorrect';
        feedback.innerHTML = `<strong>✗ Incorrect</strong><br>${question.explanation}`;
    }
    
    feedback.classList.remove('hidden');
    
    // Show next button
    document.getElementById('qaNextBtn').classList.remove('hidden');
    
    // Update score
    updateQAScore();
}

function rewardCorrectAnswer() {
    if (!pet) return;
    
    // Reward: $5 and small stat boost
    pet.budget += 5.00;
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.health = Math.min(100, pet.health + 3);
    
    showMessage(`Great answer! You earned $5.00 and your pet is happier!`, 'success');
    updatePetDisplay();
}

function nextQuestion() {
    qaState.currentQuestion++;
    displayQuestion();
}

function endQA() {
    const totalQuestions = qaState.questions.length;
    const percentage = Math.round((qaState.score / totalQuestions) * 100);
    
    // Final reward based on score
    if (!pet) return;
    
    let bonusReward = 0;
    if (percentage === 100) {
        bonusReward = 15.00;
        pet.happiness = Math.min(100, pet.happiness + 15);
        showMessage(`Perfect score! Bonus reward: $${bonusReward.toFixed(2)} and your pet is very happy!`, 'success');
    } else if (percentage >= 80) {
        bonusReward = 10.00;
        pet.happiness = Math.min(100, pet.happiness + 10);
        showMessage(`Excellent! Bonus reward: $${bonusReward.toFixed(2)}!`, 'success');
    } else if (percentage >= 60) {
        bonusReward = 5.00;
        showMessage(`Good job! Bonus reward: $${bonusReward.toFixed(2)}!`, 'success');
    } else {
        showMessage(`Keep learning! You scored ${qaState.score}/${totalQuestions}.`, 'info');
    }
    
    pet.budget += bonusReward;
    updatePetDisplay();
    
    // Show final score
    const optionsContainer = document.getElementById('qaOptions');
    const feedback = document.getElementById('qaFeedback');
    
    optionsContainer.innerHTML = '';
    feedback.className = 'qa-feedback';
    feedback.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h3>Quiz Complete! 🎉</h3>
            <p style="font-size: 1.2em; margin: 15px 0;">
                Final Score: <strong>${qaState.score}/${totalQuestions}</strong> (${percentage}%)
            </p>
            <p>${percentage === 100 ? 'Perfect! You\'re a pet care expert!' : percentage >= 80 ? 'Great job! Keep learning!' : 'Good effort! Try again to improve!'}</p>
        </div>
    `;
    feedback.classList.remove('hidden');
    
    document.getElementById('qaQuestion').textContent = '';
    document.getElementById('qaQuestionNumber').textContent = 'Quiz Complete!';
    document.getElementById('qaNextBtn').textContent = 'Close';
    document.getElementById('qaNextBtn').onclick = closeQA;
}

function updateQAScore() {
    document.getElementById('qaScore').textContent = `Score: ${qaState.score}/${qaState.currentQuestion + (qaState.answered ? 1 : 0)}`;
}

// Help Menu Functions
function openHelp() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.remove('hidden');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function closeHelp() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.add('hidden');
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
}

