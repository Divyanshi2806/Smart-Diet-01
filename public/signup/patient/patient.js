console.log('🔧 Loading patient.js...');
const db = window.firebaseFirestore;
const auth = window.firebaseAuth;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing patient dashboard...');
    initializePatientDashboard();
});

async function initializePatientDashboard() {
    console.log('🚀 Starting patient dashboard...');
    
    if (!auth) {
        console.error('❌ Firebase Auth not available');
        return;
    }
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 Patient logged in:', user.uid);           
            await loadPatientData(user.uid);
            setupAllFeatures();
            
        } else {
            window.location.href = "login.html";
        }
    });
}

async function loadPatientData(patientId) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        const patientRef = doc(db, 'patients', patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
            const patientData = patientSnap.data();
            console.log('📋 Patient data loaded:', patientData);
            
            if (patientData.assignedNutritionist) {
                await loadNutritionistData(patientData.assignedNutritionist);
            } else if (patientData.requestedNutritionist) {
                await loadNutritionistData(patientData.requestedNutritionist);
            }
            updatePatientDashboard(patientData);
        } else {
            console.log('❌ No patient data found');
        }
        
    } catch (error) {
        console.error('Error loading patient data:', error);
    }
}

async function loadNutritionistData(nutritionistId) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        const nutritionistRef = doc(db, 'users', nutritionistId);
        const nutritionistSnap = await getDoc(nutritionistRef);
        
        if (nutritionistSnap.exists()) {
            const nutritionistData = nutritionistSnap.data();
            console.log('👨‍⚕️ Nutritionist data loaded:', nutritionistData);
            
            updateNutritionistUI(nutritionistData);
        }
        
    } catch (error) {
        console.error('Error loading nutritionist data:', error);
    }
}

function updatePatientDashboard(patientData) {
    console.log('🎨 Updating patient dashboard with real data...');
    const userInfo = document.getElementById('user-info');
    if (userInfo && patientData.name) {
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">${patientData.name}</span>
                <span class="user-status">${patientData.assignmentStatus === 'approved' ? 'Active Patient' : 'Pending Approval'}</span>
            </div>
            <div class="user-avatar">${patientData.name.charAt(0)}</div>
        `;
    }
    updateProgressSummary(patientData);
}

function updateNutritionistUI(nutritionistData) {
    console.log('🎨 Updating nutritionist UI with real data...');
    
    const nutritionistProfile = document.getElementById('nutritionist-profile');
    if (nutritionistProfile) {
        nutritionistProfile.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">${nutritionistData.name ? nutritionistData.name.charAt(0) : 'N'}</div>
                <div class="profile-info">
                    <h3>${nutritionistData.name || 'Your Nutritionist'}</h3>
                    <p class="specialization">${nutritionistData.specialization || 'Certified Nutritionist'}</p>
                    <div class="rating">
                        ${renderStarRating(nutritionistData.rating || 4.5)}
                        <span>${nutritionistData.rating || 4.5} (${nutritionistData.reviews || 0} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="profile-details">
                ${renderNutritionistQualifications(nutritionistData)}
                ${renderNutritionistContact(nutritionistData)}
            </div>
        `;
    }

    const nutritionistStatus = document.getElementById('nutritionist-status');
    if (nutritionistStatus) {
        nutritionistStatus.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${nutritionistData.name || 'Nutritionist'} is Online</span>
        `;
        nutritionistStatus.className = 'nutritionist-status online';
    }
}
function renderNutritionistQualifications(nutritionistData) {
    const qualifications = nutritionistData.qualifications || ['Registered Dietitian', 'Certified Nutrition Specialist'];
    const specializations = nutritionistData.specializations || ['Weight Management', 'Sports Nutrition'];
    
    return `
        <div class="detail-item">
            <h4>Qualifications</h4>
            <ul>
                ${qualifications.map(qual => `<li>${qual}</li>`).join('')}
            </ul>
        </div>
        <div class="detail-item">
            <h4>Specializations</h4>
            <div class="specialization-tags">
                ${specializations.map(spec => `<span class="tag">${spec}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderNutritionistContact(nutritionistData) {
    return `
        <div class="detail-item">
            <h4>Contact Information</h4>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${nutritionistData.email || 'contact@smartdiet.com'}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${nutritionistData.phone || '+1 (555) 123-4567'}</span>
                </div>
            </div>
        </div>
    `;
}

function updateProgressSummary(patientData) {
    const progressSummary = document.getElementById('progress-summary');
    if (progressSummary) {
        progressSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${patientData.daysFollowing || 0}</span>
                <span class="summary-label">Days Following Plan</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${patientData.adherence || 0}%</span>
                <span class="summary-label">Plan Adherence</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${patientData.progress || '0kg'}</span>
                <span class="summary-label">Progress</span>
            </div>
        `;
    }
    updateProgressCharts(patientData);
}

function updateProgressCharts(patientData) {
    const progressCharts = document.getElementById('progress-charts');
    if (progressCharts) {
        progressCharts.innerHTML = `
            <div class="chart-card">
                <h3>Weight Progress</h3>
                <div class="chart-placeholder">
                    <p>${patientData.progress || 'No progress data yet'}</p>
                    <p><small>Your nutritionist will track your weight progress here</small></p>
                </div>
            </div>
            <div class="chart-card">
                <h3>Nutrition Adherence</h3>
                <div class="chart-placeholder">
                    <p>Adherence: ${patientData.adherence || 0}%</p>
                    <p><small>Based on your meal plan compliance</small></p>
                </div>
            </div>
            <div class="chart-card">
                <h3>Weekly Summary</h3>
                <div class="chart-placeholder">
                    <p>${patientData.daysFollowing || 0} days active this week</p>
                    <p><small>Keep up the good work!</small></p>
                </div>
            </div>
        `;
    }
}

function renderStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

async function loadDietPlan(patientId) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        const dietPlanRef = doc(db, 'dietPlans', patientId);
        const dietPlanSnap = await getDoc(dietPlanRef);
        
        if (dietPlanSnap.exists()) {
            const dietPlan = dietPlanSnap.data();
            console.log('📝 Diet plan loaded:', dietPlan);
            renderDietPlan(dietPlan);
        } else {
            renderNoDietPlan();
        }
        
    } catch (error) {
        console.error('Error loading diet plan:', error);
        renderNoDietPlan();
    }
}

function renderDietPlan(dietPlan) {
    const mealCards = document.getElementById('meal-cards');
    if (!mealCards) return;

    const meals = [
        { type: 'breakfast', icon: 'fas fa-sun', time: '8:00 AM' },
        { type: 'lunch', icon: 'fas fa-utensils', time: '1:00 PM' },
        { type: 'dinner', icon: 'fas fa-moon', time: '7:00 PM' },
        { type: 'snacks', icon: 'fas fa-apple-alt', time: 'As needed' }
    ];

    mealCards.innerHTML = meals.map(meal => {
        const mealData = dietPlan[meal.type];
        if (!mealData) {
            return `
                <div class="meal-card">
                    <div class="meal-header">
                        <h3><i class="${meal.icon}"></i> ${capitalizeFirst(meal.type)}</h3>
                        <span class="meal-time">${meal.time}</span>
                    </div>
                    <div class="meal-content">
                        <p>No ${meal.type} plan assigned yet.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="meal-card">
                <div class="meal-header">
                    <h3><i class="${meal.icon}"></i> ${capitalizeFirst(meal.type)}</h3>
                    <span class="meal-time">${meal.time}</span>
                </div>
                <div class="meal-content">
                    <h4>${mealData.name || 'Meal'}</h4>
                    <p class="meal-description">${mealData.description || 'Description not available'}</p>
                    <div class="nutrition-info">
                        ${renderNutritionInfo(mealData.nutrition || {})}
                    </div>
                </div>
                ${mealData.notes ? `
                    <div class="nutritionist-notes">
                        <h5><i class="fas fa-sticky-note"></i> Nutritionist's Notes</h5>
                        <p>${mealData.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderNoDietPlan() {
    const mealCards = document.getElementById('meal-cards');
    if (mealCards) {
        mealCards.innerHTML = `
            <div class="no-diet-plan">
                <h3>No Diet Plan Assigned Yet</h3>
                <p>Your nutritionist will create a personalized diet plan for you soon.</p>
                <p><small>Check back later or message your nutritionist for updates.</small></p>
            </div>
        `;
    }
}

function renderNutritionInfo(nutrition) {
    return Object.entries(nutrition).map(([key, value]) => `
        <div class="nutrition-item">
            <span class="nutrition-value">${value}</span>
            <span class="nutrition-label">${capitalizeFirst(key)}</span>
        </div>
    `).join('');
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setupAllFeatures() {
    console.log('⚙️ Setting up all features...');
    
    setupNavigation();
    setupChat();
    setupButtons();
    loadDietPlan(auth.currentUser.uid);
    
    console.log('✅ All features setup complete');
}

function setupNavigation() {
    console.log('🔧 Setting up navigation...');
    
    const menuItems = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📱 Navigation clicked:', this.getAttribute('data-tab'));
            
            // Remove active from all
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            const targetId = this.getAttribute('data-tab');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupChat() {
    console.log('🔧 Setting up chat...');
    
    const sendBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('message-input');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', function() {
            sendMessage();
        });
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const messages = document.getElementById('chat-history');
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message patient-message';
        messageDiv.innerHTML = `
            <p>${input.value}</p>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        if (messages) {
            if (messages.querySelector('.no-messages')) {
                messages.innerHTML = '';
            }
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        input.value = '';
        setTimeout(() => {
            simulateNutritionistReply();
        }, 1000);
    }
}

function simulateNutritionistReply() {
    const messages = document.getElementById('chat-history');
    const replies = [
        "Thanks for your message! I'll review your progress and get back to you.",
        "That's great to hear! Keep up the good work with your diet plan.",
        "I've reviewed your progress. Let's schedule a call to discuss adjustments.",
        "Your adherence to the plan is excellent! Any challenges you're facing?"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    if (messages) {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'message nutritionist-message';
        replyDiv.innerHTML = `
            <p>${randomReply}</p>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messages.appendChild(replyDiv);
        messages.scrollTop = messages.scrollHeight;
    }
}

function setupButtons() {
    console.log('🔧 Setting up buttons...');
    const downloadBtn = document.getElementById('download-plan');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('Downloading diet plan as PDF...');
        });
    }
    
    const bookSession = document.getElementById('book-session');
    if (bookSession) {
        bookSession.addEventListener('click', function() {
            alert('Opening appointment scheduler...');
        });
    }
    
    const videoCall = document.getElementById('video-call');
    if (videoCall) {
        videoCall.addEventListener('click', function() {
            alert('Starting video call with nutritionist...');
        });
    }
}