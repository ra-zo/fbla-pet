let pet = null;

// Emojis used for fun action feedback around the pet image
const ACTION_EMOJI_MAP = {
    feed: ['🍗', '🍖', '🥣', '🍪'],
    play: ['🎾', '🦴', '🎉', '🤩'],
    rest: ['💤', '😴', '🌙', '🛏️'],
    clean: ['🛁', '🧼', '🧽', '✨'],
    healthCheck: ['💖', '💊', '🏥', '🩺'],
    buyToy: ['🧸', '🎈', '🎁', '🐾'],
    chore: ['💵', '💰', '📈', '⭐']
};

const PET_ANIMATION_CLASSES = [
    'pet-wiggle',
    'pet-bounce',
    'pet-cozy',
    'pet-shine',
    'pet-pulse',
    'pet-earn'
];

let spendingChart = null;
let budgetChart = null;
let budgetHistory = [];

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

    const renameBtn = document.getElementById('renamePetBtn');
    if (renameBtn) {
        renameBtn.addEventListener('click', handleRenamePet);
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
    const gameArea = document.getElementById('gameArea');
    gameArea.classList.remove('hidden');
    
    // Update display immediately (synchronously)
    updatePetDisplay();
    
    // Setup action buttons
    setupActionButtons();
    
    // Show welcome message
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
            playPetAnimation('pet-bounce');
            break;
        case 'play':
            result = pet.play();
            playPetAnimation('pet-wiggle');
            break;
        case 'rest':
            result = pet.rest();
            playPetAnimation('pet-cozy');
            break;
        case 'clean':
            result = pet.clean();
            playPetAnimation('pet-shine');
            break;
        case 'healthCheck':
            result = pet.healthCheck();
            playPetAnimation('pet-pulse');
            break;
        case 'buyToy':
            result = pet.buyToy();
            playPetAnimation('pet-wiggle');
            break;
    }
    
    if (result) {
        if (result.success) {
            showMessage(result.message, 'success');
            triggerActionEmojis(action);
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
        triggerActionEmojis('chore');
        playPetAnimation('pet-earn');
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
    
    const petNameText = document.getElementById('petNameText');
    if (petNameText) petNameText.textContent = pet.name;
    
    const mood = pet.getMood();
    const moodElement = document.getElementById('petMood');
    if (moodElement) {
    moodElement.textContent = mood.text;
    moodElement.className = 'pet-mood ' + mood.class;
    }
    
    // Update stats
    updateStatBar('hunger', pet.hunger);
    updateStatBar('happiness', pet.happiness);
    updateStatBar('health', pet.health);
    updateStatBar('energy', pet.energy);
    
    const availableBudgetEl = document.getElementById('availableBudget');
    const totalSpentEl = document.getElementById('totalSpent');
    const savingsGoalEl = document.getElementById('savingsGoal');
    if (availableBudgetEl) availableBudgetEl.textContent = `$${pet.budget.toFixed(2)}`;
    if (totalSpentEl) totalSpentEl.textContent = `$${pet.totalSpent.toFixed(2)}`;
    if (savingsGoalEl) savingsGoalEl.textContent = `$${pet.savingsGoal.toFixed(2)}`;
    
    const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
    if (totalExpensesDisplay) {
        totalExpensesDisplay.textContent = `$${pet.totalSpent.toFixed(0)}`;
    }
    
    updateExpenseList();
    updateSavingsProgress();
    updateButtonStates();
    
    recordBudgetPoint();
    updateSpendingChart();
    updateBudgetChart();
}

function updateStatBar(statName, value) {
    const bar = document.getElementById(statName + 'Bar');
    const valueElement = document.getElementById(statName + 'Value');
    
    if (bar && valueElement) {
        // Update immediately without transitions for initial load
        const isInitialLoad = !bar.style.width || bar.style.width === '0%';
        if (isInitialLoad) {
            bar.style.transition = 'none';
        }
        
        bar.style.width = value + '%';
        valueElement.textContent = Math.round(value);
        
        // Change color based on value with gradients
        if (value > 70) {
            bar.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        } else if (value > 40) {
            bar.style.background = 'linear-gradient(90deg, #ffc107, #ff9800)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
        }
        
        // Re-enable transitions after initial load
        if (isInitialLoad) {
            setTimeout(() => {
                bar.style.transition = 'width 0.5s ease, background 0.3s ease';
            }, 100);
        }
    }
}

function recordBudgetPoint() {
    if (!pet) return;
    
    budgetHistory.push({
        label: budgetHistory.length + 1,
        available: pet.budget,
        spent: pet.totalSpent
    });
    
    if (budgetHistory.length > 20) {
        budgetHistory.shift();
    }
}

function updateSpendingChart() {
    if (typeof Chart === 'undefined' || !pet) return;
    
    const canvas = document.getElementById('spendingChart');
    if (!canvas) return;
    
    const breakdown = pet.getExpenseBreakdown();
    const labels = Object.keys(breakdown);
    if (labels.length === 0) {
        if (spendingChart) {
            spendingChart.destroy();
            spendingChart = null;
        }
        return;
    }
    
    const data = labels.map(label => breakdown[label]);
    const colors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
        '#59a14f', '#edc949', '#af7aa1', '#ff9da7'
    ];
    
    if (spendingChart) {
        spendingChart.destroy();
    }
    
    spendingChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        boxHeight: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const label = ctx.label || '';
                            const value = ctx.parsed;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            },
            cutout: '55%'
        }
    });
}

function updateBudgetChart() {
    if (typeof Chart === 'undefined') return;
    
    const canvas = document.getElementById('budgetChart');
    if (!canvas || budgetHistory.length === 0) return;
    
    const labels = budgetHistory.map(point => `Turn ${point.label}`);
    const availableData = budgetHistory.map(point => point.available);
    const spentData = budgetHistory.map(point => point.spent);
    
    if (budgetChart) {
        budgetChart.destroy();
    }
    
    budgetChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Available Budget',
                    data: availableData,
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78,205,196,0.2)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Total Spent',
                    data: spentData,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255,107,107,0.15)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `$${value}`
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const label = ctx.dataset.label || '';
                            const value = ctx.parsed.y;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
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
    // Use Sonner toast API
    if (window.toast) {
        const toastOptions = {
            duration: 5000,
        };
        
        switch(type) {
            case 'success':
                window.toast.success(message, toastOptions);
                break;
            case 'error':
                window.toast.error(message, toastOptions);
                break;
            case 'warning':
                window.toast.warning(message, toastOptions);
                break;
            case 'info':
            default:
                window.toast.info(message, toastOptions);
                break;
        }
    } else {
        // Fallback to console if toast is not loaded
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

function handleRenamePet() {
    if (!pet) {
        showMessage('Please create your pet before renaming!', 'error');
        return;
    }
    
    const newName = prompt('Rename your pet:', pet.name);
    if (newName === null) return;
    
    const trimmed = newName.trim();
    if (!trimmed) {
        showMessage('Pet name cannot be empty!', 'error');
        return;
    }
    
    pet.name = trimmed;
    updatePetDisplay();
    showMessage(`Your pet is now called ${trimmed}!`, 'success');
}

function triggerActionEmojis(actionKey) {
    const emojis = ACTION_EMOJI_MAP[actionKey];
    if (!emojis) return;
    
    const wrapper = document.querySelector('.pet-video-wrapper');
    if (!wrapper) return;
    
    const bursts = 3;
    for (let i = 0; i < bursts; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        createEmojiBurst(wrapper, emoji);
    }
}

function createEmojiBurst(wrapper, emoji) {
    const burst = document.createElement('span');
    burst.className = 'pet-emoji-burst';
    burst.textContent = emoji;
    
    const offsetX = (Math.random() * 60) - 30;
    const offsetY = (Math.random() * 40) - 20;
    burst.style.left = `calc(50% + ${offsetX}px)`;
    burst.style.top = `calc(50% + ${offsetY}px)`;
    
    wrapper.appendChild(burst);
    
    setTimeout(() => {
        burst.remove();
    }, 1200);
}

function playPetAnimation(animationClass) {
    const img = document.querySelector('.pet-image');
    if (!img) return;
    
    PET_ANIMATION_CLASSES.forEach(cls => img.classList.remove(cls));
    // Force reflow so the animation can restart
    void img.offsetWidth;
    img.classList.add(animationClass);
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

