class VirtualPet {
    constructor(name, type, startingBudget) {
        this.name = name;
        this.type = type;
        this.hunger = 100;
        this.happiness = 100;
        this.health = 100;
        this.energy = 100;
        this.budget = startingBudget;
        this.totalSpent = 0;
        this.savingsGoal = 0;
        this.expenses = [];
        this.lastUpdate = Date.now();
        
        // Pet type emojis
        this.typeEmojis = {
            dog: '🐕',
            cat: '🐱',
            rabbit: '🐰',
            bird: '🐦',
            hamster: '🐹'
        };
        
        // Care costs
        this.costs = {
            feed: 5.00,
            play: 3.00,
            rest: 0.00,
            clean: 4.00,
            healthCheck: 15.00,
            toy: 10.00
        };
        
        // Chore rewards
        this.choreRewards = {
            study: 5.00,
            cleanRoom: 8.00,
            waterPlants: 3.00,
            homework: 6.00
        };
        
        // Start decay timer
        this.startDecay();
    }
    
    startDecay() {
        // Pet stats decay over time
        setInterval(() => {
            this.hunger = Math.max(0, this.hunger - 0.5);
            this.happiness = Math.max(0, this.happiness - 0.3);
            this.energy = Math.max(0, this.energy - 0.4);
            
            // Health decreases if other stats are low
            if (this.hunger < 30 || this.happiness < 30) {
                this.health = Math.max(0, this.health - 0.2);
            }
            
            // Update UI
            if (window.updatePetDisplay) {
                window.updatePetDisplay();
            }
        }, 5000); // Update every 5 seconds
    }
    
    getEmoji() {
        return this.typeEmojis[this.type] || '🐾';
    }
    
    getMood() {
        const avgStat = (this.hunger + this.happiness + this.health + this.energy) / 4;
        
        if (this.health < 30) {
            return { text: '😷 Sick', class: 'mood-sick' };
        } else if (avgStat < 30) {
            return { text: '😢 Sad', class: 'mood-sad' };
        } else if (this.energy > 80 && this.happiness > 70) {
            return { text: '⚡ Energetic', class: 'mood-energetic' };
        } else if (this.energy < 30) {
            return { text: '😴 Tired', class: 'mood-tired' };
        } else if (avgStat > 70) {
            return { text: '😊 Happy', class: 'mood-happy' };
        } else {
            return { text: '😐 Neutral', class: 'mood-happy' };
        }
    }
    
    feed() {
        if (this.budget < this.costs.feed) {
            return { success: false, message: `Not enough money! Need $${this.costs.feed.toFixed(2)}` };
        }
        
        this.budget -= this.costs.feed;
        this.totalSpent += this.costs.feed;
        this.hunger = Math.min(100, this.hunger + 30);
        this.happiness = Math.min(100, this.happiness + 5);
        
        this.addExpense('Food', this.costs.feed);
        
        return { 
            success: true, 
            message: `${this.name} enjoyed the meal! Hunger +30, Happiness +5` 
        };
    }
    
    play() {
        if (this.budget < this.costs.play) {
            return { success: false, message: `Not enough money! Need $${this.costs.play.toFixed(2)}` };
        }
        
        if (this.energy < 20) {
            return { success: false, message: `${this.name} is too tired to play!` };
        }
        
        this.budget -= this.costs.play;
        this.totalSpent += this.costs.play;
        this.happiness = Math.min(100, this.happiness + 25);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.max(0, this.hunger - 5);
        
        this.addExpense('Play Activity', this.costs.play);
        
        return { 
            success: true, 
            message: `${this.name} had a great time playing! Happiness +25, Energy -15` 
        };
    }
    
    rest() {
        this.energy = Math.min(100, this.energy + 40);
        this.health = Math.min(100, this.health + 5);
        
        return { 
            success: true, 
            message: `${this.name} is well-rested! Energy +40, Health +5` 
        };
    }
    
    clean() {
        if (this.budget < this.costs.clean) {
            return { success: false, message: `Not enough money! Need $${this.costs.clean.toFixed(2)}` };
        }
        
        this.budget -= this.costs.clean;
        this.totalSpent += this.costs.clean;
        this.health = Math.min(100, this.health + 15);
        this.happiness = Math.min(100, this.happiness + 10);
        
        this.addExpense('Cleaning Supplies', this.costs.clean);
        
        return { 
            success: true, 
            message: `${this.name} is clean and fresh! Health +15, Happiness +10` 
        };
    }
    
    healthCheck() {
        if (this.budget < this.costs.healthCheck) {
            return { success: false, message: `Not enough money! Need $${this.costs.healthCheck.toFixed(2)}` };
        }
        
        this.budget -= this.costs.healthCheck;
        this.totalSpent += this.costs.healthCheck;
        this.health = Math.min(100, this.health + 30);
        
        this.addExpense('Vet Visit', this.costs.healthCheck);
        
        return { 
            success: true, 
            message: `${this.name} got a clean bill of health! Health +30` 
        };
    }
    
    buyToy() {
        if (this.budget < this.costs.toy) {
            return { success: false, message: `Not enough money! Need $${this.costs.toy.toFixed(2)}` };
        }
        
        this.budget -= this.costs.toy;
        this.totalSpent += this.costs.toy;
        this.happiness = Math.min(100, this.happiness + 20);
        
        this.addExpense('Toy Purchase', this.costs.toy);
        
        return { 
            success: true, 
            message: `${this.name} loves the new toy! Happiness +20` 
        };
    }
    
    doChore(choreType) {
        const reward = this.choreRewards[choreType];
        if (!reward) return { success: false, message: 'Invalid chore!' };
        
        this.budget += reward;
        
        const choreNames = {
            study: 'Study',
            cleanRoom: 'Clean Room',
            waterPlants: 'Water Plants',
            homework: 'Homework'
        };
        
        return { 
            success: true, 
            message: `Completed ${choreNames[choreType]}! Earned $${reward.toFixed(2)}` 
        };
    }
    
    setSavingsGoal(amount) {
        if (amount < 10) {
            return { success: false, message: 'Goal must be at least $10!' };
        }
        
        this.savingsGoal = amount;
        return { 
            success: true, 
            message: `Savings goal set to $${amount.toFixed(2)}!` 
        };
    }
    
    getSavingsProgress() {
        if (this.savingsGoal === 0) return 0;
        const progress = (this.budget / this.savingsGoal) * 100;
        return Math.min(100, progress);
    }
    
    addExpense(category, amount) {
        this.expenses.push({
            category,
            amount,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Keep only last 20 expenses
        if (this.expenses.length > 20) {
            this.expenses.shift();
        }
    }
    
    getExpenseBreakdown() {
        const breakdown = {};
        this.expenses.forEach(expense => {
            if (!breakdown[expense.category]) {
                breakdown[expense.category] = 0;
            }
            breakdown[expense.category] += expense.amount;
        });
        return breakdown;
    }
}

