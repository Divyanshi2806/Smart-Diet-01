class SimplePatientApp {
    constructor() {
        this.data = appData;
        this.currentTab = 'diet-plan';
        this.currentUser = null;
        this.useFirebase = false;
        this.currentPatientData = null;
        this.init();
    }

    async init() {
        console.log('🚀 Simple Patient App Initialized');
        
        setTimeout(() => {
            this.checkFirebaseAndInitialize();
        }, 100);
    }

    async checkFirebaseAndInitialize() {
        console.log('🔍 Checking for Firebase...');
        
        if (window.firebaseAuth && window.firebaseFirestore) {
            console.log('✅ Firebase detected, initializing...');
            await this.initializeFirebaseAuth();
        } else {
            console.log('❌ Firebase not available, using demo data');
            this.useDemoData();
        }
        
        this.renderHeader();
        this.renderNavigation();
        this.setupEventListeners();
        this.activateTab(this.currentTab);
    }

    async initializeFirebaseAuth() {
        const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
        return new Promise((resolve) => {
            onAuthStateChanged(window.firebaseAuth, async (user) => {
                if (user) {
                    this.currentUser = user;
                    this.useFirebase = true;
                    console.log('✅ Patient logged in:', user.email);
                    
                    await this.loadPatientDataFromFirestore();
                    
                    this.setupFirebaseListeners();
                    
                    resolve();
                } else {
                    console.log('ℹ️ No Firebase user, using demo data');
                    this.useDemoData();
                    resolve();
                }
            });
        });
    }

    async loadPatientDataFromFirestore() {
        if (!this.useFirebase || !this.currentUser) return;
        
        try {
            const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            
            const patientRef = doc(window.firebaseFirestore, 'patients', this.currentUser.uid);
            const patientSnap = await getDoc(patientRef);
            
            if (patientSnap.exists()) {
                this.currentPatientData = patientSnap.data();
                console.log('✅ Patient data loaded:', this.currentPatientData);
                
                this.updatePatientHeader();
                this.renderAllSectionsWithFirebaseData();
            } else {
                console.log('❌ No patient data found');
                this.useDemoData();
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
            this.useDemoData();
        }
    }

    setupFirebaseListeners() {
        if (!this.useFirebase) return;
        
        this.setupDietPlanListener();
        
        this.setupPatientDataListener();
    }

    async setupDietPlanListener() {
        try {
            const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            
            const dietPlanRef = doc(window.firebaseFirestore, 'dietPlans', this.currentUser.uid);
            onSnapshot(dietPlanRef, (snapshot) => {
                if (snapshot.exists()) {
                    const dietPlan = snapshot.data();
                    console.log('📝 Diet plan updated:', dietPlan);
                    this.renderDietPlanFromFirebase(dietPlan);
                } else {
                    console.log('📝 No diet plan found');
                    this.renderDietPlanFromDemo();
                }
            });
        } catch (error) {
            console.error('Error setting up diet plan listener:', error);
            this.renderDietPlanFromDemo();
        }
    }

    async setupPatientDataListener() {
        try {
            const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            
            const patientRef = doc(window.firebaseFirestore, 'patients', this.currentUser.uid);
            onSnapshot(patientRef, (snapshot) => {
                if (snapshot.exists()) {
                    const patientData = snapshot.data();
                    this.currentPatientData = patientData;
                    console.log('👤 Patient data updated:', patientData);
                    
                    this.updatePatientHeader();
                    
                    this.updateNutritionistSection();
                }
            });
        } catch (error) {
            console.error('Error setting up patient data listener:', error);
        }
    }

    updatePatientHeader() {
        const userInfo = document.getElementById('user-info');
        if (!userInfo) return;
        
        const patientName = this.currentPatientData?.name || this.data.patient.name;
        const nutritionistName = this.currentPatientData?.assignedNutritionistName || 'Not Assigned';
        const status = this.currentPatientData?.status || 'pending';
        
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">${patientName}</span>
                <span class="user-status">
                    ${status === 'approved' ? '✅ Approved' : '⏳ Pending'} | 
                    Nutritionist: ${nutritionistName}
                    ${this.useFirebase ? ' 🔗' : ' 💾'}
                </span>
            </div>
            <div class="user-avatar">${patientName.charAt(0)}</div>
        `;
    }

    renderAllSectionsWithFirebaseData() {
        this.renderChatFromDemo();
        this.renderProgressFromDemo();
        this.updateNutritionistSection();
    }

    updateNutritionistSection() {
        const nutritionistProfile = document.getElementById('nutritionist-profile');
        const nutritionistStatus = document.getElementById('nutritionist-status');
        
        if (!nutritionistProfile || !nutritionistStatus) return;
        
        const nutritionistName = this.currentPatientData?.assignedNutritionistName || 'Not Assigned';
        const status = this.currentPatientData?.status || 'pending';
        
        nutritionistStatus.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>Your Nutritionist: ${nutritionistName} (${status})</span>
        `;
        
        if (this.currentPatientData?.assignedNutritionistName) {
            nutritionistProfile.innerHTML = `
                <div class="profile-header">
                    <div class="profile-avatar">${nutritionistName.charAt(0)}</div>
                    <div class="profile-info">
                        <h3>${nutritionistName}</h3>
                        <p class="specialization">Your ${status === 'approved' ? 'Approved' : 'Requested'} Nutritionist</p>
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                            <span>4.5</span>
                        </div>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-item">
                        <h4>Assignment Status</h4>
                        <p>${status === 'approved' ? '✅ Approved' : '⏳ Waiting for Approval'}</p>
                    </div>
                    ${this.currentPatientData.assignedAt ? `
                        <div class="detail-item">
                            <h4>Request Sent</h4>
                            <p>${new Date(this.currentPatientData.assignedAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                    ` : ''}
                    ${status === 'approved' && this.currentPatientData.approvedAt ? `
                        <div class="detail-item">
                            <h4>Approved On</h4>
                            <p>${new Date(this.currentPatientData.approvedAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            nutritionistProfile.innerHTML = `
                <div class="profile-header">
                    <div class="profile-avatar">?</div>
                    <div class="profile-info">
                        <h3>No Nutritionist Assigned</h3>
                        <p class="specialization">Please select a nutritionist</p>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-item">
                        <p>You haven't selected a nutritionist yet.</p>
                        <button class="btn-primary" onclick="window.location.href='../login.html'">
                            Select Nutritionist
                        </button>
                    </div>
                </div>
            `;
        }
    }

    renderDietPlanFromFirebase(dietPlan) {
        const mealCards = document.getElementById('meal-cards');
        if (!mealCards) return;
        
        const meals = [
            { type: 'breakfast', icon: 'fas fa-sun', time: '8:00 AM' },
            { type: 'lunch', icon: 'fas fa-utensils', time: '1:00 PM' },
            { type: 'dinner', icon: 'fas fa-moon', time: '7:00 PM' }
        ];

        mealCards.innerHTML = meals.map(meal => {
            const mealContent = dietPlan[meal.type];
            
            return `
                <div class="meal-card">
                    <div class="meal-header">
                        <h3><i class="${meal.icon}"></i> ${this.capitalizeFirst(meal.type)}</h3>
                        <span class="meal-time">${meal.time}</span>
                    </div>
                    <div class="meal-content">
                        <h4>${mealContent || 'Meal plan being prepared...'}</h4>
                        ${mealContent ? `
                            <p class="meal-description">${mealContent}</p>
                        ` : '<p>Your nutritionist is preparing your meal plan...</p>'}
                        <div class="nutrition-info">
                            <div class="nutrition-item">
                                <span class="nutrition-value">${dietPlan.calorieTarget || 'N/A'}</span>
                                <span class="nutrition-label">Calories</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${dietPlan.duration || 'N/A'}</span>
                                <span class="nutrition-label">Weeks</span>
                            </div>
                        </div>
                    </div>
                    ${dietPlan.planName ? `
                        <div class="nutritionist-notes">
                            <h5><i class="fas fa-sticky-note"></i> Plan: ${dietPlan.planName}</h5>
                            <p>Created by: ${dietPlan.nutritionistName || 'Your Nutritionist'}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        this.renderPeriodSelector();
    }

    renderDietPlanFromDemo() {
        const mealCards = document.getElementById('meal-cards');
        if (!mealCards) return;
        
        const meals = this.data.dietPlan.meals;

        mealCards.innerHTML = meals.map(meal => `
            <div class="meal-card">
                <div class="meal-header">
                    <h3><i class="${meal.icon}"></i> ${this.capitalizeFirst(meal.type)}</h3>
                    <span class="meal-time">${meal.time}</span>
                </div>
                <div class="meal-content">
                    <h4>${meal.name}</h4>
                    <p class="meal-description">${meal.description}</p>
                    <div class="nutrition-info">
                        ${this.renderNutritionInfo(meal.nutrition)}
                    </div>
                </div>
                <div class="nutritionist-notes">
                    <h5><i class="fas fa-sticky-note"></i> Nutritionist's Notes</h5>
                    <p>${meal.notes}</p>
                </div>
            </div>
        `).join('');

        this.renderPeriodSelector();
    }

    renderPeriodSelector() {
        const periodSelector = document.getElementById('period-selector');
        if (!periodSelector) return;
        
        const periods = this.data.dietPlan.periods;

        periodSelector.innerHTML = periods.map(period => `
            <button class="period-btn ${period === 'Daily' ? 'active' : ''}">${period}</button>
        `).join('');
    }

    renderChatFromDemo() {
        const chatHistory = document.getElementById('chat-history');
        const nutritionistStatus = document.getElementById('nutritionist-status');
        
        if (!chatHistory || !nutritionistStatus) return;
        
        const messages = this.data.chat.messages;
        const nutritionist = this.data.chat.nutritionist;

        const realNutritionistName = this.currentPatientData?.assignedNutritionistName || nutritionist.name;
        
        nutritionistStatus.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${realNutritionistName} is ${this.capitalizeFirst(nutritionist.status)}</span>
        `;
        nutritionistStatus.className = `nutritionist-status ${nutritionist.status}`;

        chatHistory.innerHTML = messages.map(message => `
            <div class="message ${message.sender}-message">
                ${message.sender === 'nutritionist' ? `
                    <div class="message-avatar">
                        <div class="avatar-placeholder">${realNutritionistName.charAt(0)}</div>
                    </div>
                ` : ''}
                <div class="message-content">
                    <div class="message-sender">${message.sender === 'nutritionist' ? realNutritionistName : 'You'}</div>
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${message.time}</div>
                </div>
                ${message.sender === 'patient' ? `
                    <div class="message-avatar">
                        <div class="avatar-placeholder">${this.currentPatientData?.name?.charAt(0) || 'P'}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    renderProgressFromDemo() {
        this.renderProgressSummary(this.data.progress.summary);
        this.renderProgressCharts();
        this.renderProgressBadges(this.data.progress.badges);
    }

    renderProgressSummary(summary) {
        const progressSummary = document.getElementById('progress-summary');
        if (!progressSummary) return;
        
        progressSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${summary.streak || 0}</span>
                <span class="summary-label">Days Streak</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${summary.goals || 0}</span>
                <span class="summary-label">Goals Achieved</span>
            </div>
        `;
    }

    renderProgressCharts() {
        const chartsContainer = document.getElementById('progress-charts');
        if (!chartsContainer) return;
        
        const charts = this.data.progress.charts;

        chartsContainer.innerHTML = charts.map(chart => `
            <div class="chart-card">
                <h3>${chart.title}</h3>
                <div class="chart-placeholder" id="${chart.id}">
                    <p>Chart visualization would appear here</p>
                    <p><small>In a real application, this would show your ${chart.title.toLowerCase()} data</small></p>
                </div>
            </div>
        `).join('');
    }

    renderProgressBadges(badges) {
        const badgesContainer = document.getElementById('progress-badges');
        if (!badgesContainer) return;
        
        badgesContainer.innerHTML = badges.map(badge => `
            <div class="badge">
                <i class="${badge.icon}"></i>
                <span>${badge.label}</span>
            </div>
        `).join('');
    }

    useDemoData() {
        this.currentPatientData = this.data.patient;
        this.renderDietPlanFromDemo();
        this.renderChatFromDemo();
        this.renderProgressFromDemo();
        this.updateNutritionistSection();
    }

    renderHeader() {
        const userInfo = document.getElementById('user-info');
        if (!userInfo) return;
        
        const patientName = this.currentPatientData?.name || this.data.patient.name;

        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">${patientName}</span>
                <span class="user-status">${this.data.patient.status} ${this.useFirebase ? '🔗' : '💾'}</span>
            </div>
            <div class="user-avatar">${patientName.charAt(0)}</div>
        `;
    }

    renderNavigation() {
        const navTabs = document.getElementById('navigation-tabs');
        if (!navTabs) return;
        
        navTabs.innerHTML = this.data.tabs.map(tab => `
            <button class="tab" data-tab="${tab.id}">
                <i class="${tab.icon}"></i>
                <span>${tab.label}</span>
            </button>
        `).join('');
    }

    setupEventListeners() {
        this.setupTabNavigation();
        this.setupChatEvents();
        this.setupButtonEvents();
    }

    setupTabNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab')) {
                const tab = e.target.closest('.tab');
                const targetTab = tab.getAttribute('data-tab');
                this.activateTab(targetTab);
            }
        });
    }

    activateTab(tabId) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(tabId);
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tabId;
    }

    setupChatEvents() {
        const chatInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-message');

        if (!chatInput || !sendButton) return;

        const sendMessage = () => {
            const messageText = chatInput.value.trim();
            if (messageText) {
                if (this.useFirebase) {
                    this.sendMessageToFirebase(messageText);
                } else {
                    this.addMessageToChat('patient', messageText);
                    this.simulateNutritionistReply();
                }
                chatInput.value = '';
            }
        };

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        const videoCall = document.getElementById('video-call');
        if (videoCall) {
            videoCall.addEventListener('click', () => {
                this.showNotification('Starting video call with nutritionist...');
            });
        }
    }

    async sendMessageToFirebase(messageText) {
        console.log('Would send to Firebase:', messageText);
        this.addMessageToChat('patient', messageText);
        this.simulateNutritionistReply();
    }

    addMessageToChat(sender, text) {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        const message = {
            sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const messageElement = this.createMessageElement(message);
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    createMessageElement(message) {
        const nutritionistName = this.currentPatientData?.assignedNutritionistName || this.data.chat.nutritionist.name;
        const patientName = this.currentPatientData?.name || this.data.patient.name;

        return document.createRange().createContextualFragment(`
            <div class="message ${message.sender}-message">
                ${message.sender === 'nutritionist' ? `
                    <div class="message-avatar">
                        <div class="avatar-placeholder">${nutritionistName.charAt(0)}</div>
                    </div>
                ` : ''}
                <div class="message-content">
                    <div class="message-sender">${message.sender === 'nutritionist' ? nutritionistName : 'You'}</div>
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${message.time}</div>
                </div>
                ${message.sender === 'patient' ? `
                    <div class="message-avatar">
                        <div class="avatar-placeholder">${patientName.charAt(0)}</div>
                    </div>
                ` : ''}
            </div>
        `);
    }

    simulateNutritionistReply() {
        const replies = [
            "Thanks for the update! How are you feeling with the current meal plan?",
            "That's great to hear! Remember to stay hydrated throughout the day.",
            "I'm glad it's working well for you. Any challenges with any specific meals?",
            "Excellent progress! Let me know if you need any adjustments to your plan."
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setTimeout(() => {
            this.addMessageToChat('nutritionist', randomReply);
        }, 1500);
    }

    setupButtonEvents() {
        // Download plan button
        const downloadPlan = document.getElementById('download-plan');
        if (downloadPlan) {
            downloadPlan.addEventListener('click', () => {
                this.showNotification('Downloading your diet plan...');
            });
        }

        const bookSession = document.getElementById('book-session');
        if (bookSession) {
            bookSession.addEventListener('click', () => {
                this.showNotification('Opening appointment scheduler...');
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        
        const colors = {
            success: '#28A745',
            warning: '#FFC107',
            error: '#DC3545',
            info: '#1E90FF'
        };
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    renderNutritionInfo(nutrition) {
        return Object.entries(nutrition).map(([key, value]) => `
            <div class="nutrition-item">
                <span class="nutrition-value">${value}</span>
                <span class="nutrition-label">${this.capitalizeFirst(key)}</span>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimplePatientApp();
});