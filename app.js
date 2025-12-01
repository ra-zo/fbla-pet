let pet = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const createPetBtn = document.getElementById('createPetBtn');
    createPetBtn.addEventListener('click', createPet);
    
    // Make updatePetDisplay available globally
    window.updatePetDisplay = updatePetDisplay;
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
    
    // Update pet emoji and name
    document.getElementById('petEmoji').textContent = pet.getEmoji();
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

