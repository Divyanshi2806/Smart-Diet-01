console.log('🔧 Loading nutritionist.js...');

const db = window.firebaseFirestore;
const auth = window.firebaseAuth;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing dashboard...');
    initializeDashboard();
});

async function initializeDashboard() {
    console.log('🚀 Starting nutritionist dashboard...');
    
    if (!auth) {
        console.error('❌ Firebase Auth not available');
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 User logged in:', user.uid);
            const isVerified = await checkVerification(user.uid);
            if (!isVerified) {
                alert('Please complete verification first.');
                window.location.href = "doctor-verification.html";
                return;
            }
            
            await loadUserData(user.uid);
            
            setupAllFeatures();
            
        } else {
            window.location.href = "../login.html";
        }
    });
}

async function checkVerification(userId) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.role === 'doctor' && userData.verificationStatus === 'verified';
        }
        return false;
    } catch (error) {
        console.error('Verification check error:', error);
        return false;
    }
}

async function loadUserData(userId) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('📋 User data loaded:', userData);
            updateDashboardUI(userData);
        } else {
            console.log('❌ No user data found in Firestore');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateDashboardUI(userData) {
    console.log('🎨 Updating dashboard UI with user data...');
    
    const userName = userData.name || 'Nutritionist';
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.innerHTML = `
            <div class="user-details">
                <h3>Welcome, ${userName}</h3>
                <p>${userName}</p>
            </div>
            <div class="user-avatar">${userName.charAt(0)}</div>
        `;
    }

    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const specializationInput = document.getElementById('specialization');
        const phoneInput = document.getElementById('phone');
        
        if (nameInput) nameInput.value = userName;
        if (emailInput && userData.email) emailInput.value = userData.email;
        if (specializationInput && userData.specialization) specializationInput.value = userData.specialization;
        if (phoneInput && userData.phone) phoneInput.value = userData.phone;
    }
}

function setupAllFeatures() {
    console.log('⚙️ Setting up all features...');

    clearDemoData();
    
    setupNavigation();
    setupChat();
    setupForms();
    setupButtons();
    setupLogout();

    loadPendingRequests();
    
    console.log('✅ All features setup complete');
}

function clearDemoData() {
    console.log('🧹 Clearing demo data...');

    const patientsGrid = document.querySelector('#patients .patients-grid');
    if (patientsGrid) {
        patientsGrid.innerHTML = `
            <div class="no-patients">
                <p>No patients assigned to you yet.</p>
                <p><small>Patients will appear here once they are assigned to you.</small></p>
            </div>
        `;
    }

    const chatHistory = document.querySelector('.chat-history');
    if (chatHistory) {
        chatHistory.innerHTML = `
            <div class="no-messages">
                <p>No messages yet. Start a conversation with your patients!</p>
            </div>
        `;
    }

    const nutritionistStatus = document.querySelector('.nutritionist-status');
    if (nutritionistStatus) {
        nutritionistStatus.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>You are Online</span>
        `;
        nutritionistStatus.className = 'nutritionist-status online';
    }
}

function setupNavigation() {
    console.log('🔧 Setting up navigation...');
    
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📱 Navigation clicked:', this.getAttribute('data-section'));

            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            this.classList.add('active');
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupChat() {
    console.log('🔧 Setting up chat...');
    
    const sendBtn = document.getElementById('sendMessage');
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

        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.addEventListener('click', function() {
                chatItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                const patientName = this.querySelector('h4').textContent;
                const chatHistory = document.querySelector('.chat-history');
                if (chatHistory) {
                    chatHistory.innerHTML = `
                        <div class="message received">
                            <p>Starting conversation with ${patientName}. How can I help you today?</p>
                            <div class="message-time">${new Date().toLocaleTimeString()}</div>
                        </div>
                    `;
                }
            });
        });

        const videoCall = document.getElementById('video-call');
        if (videoCall) {
            videoCall.addEventListener('click', function() {
                alert('Starting video call with patient...');
            });
        }

        const attachImage = document.getElementById('attach-image');
        if (attachImage) {
            attachImage.addEventListener('click', function() {
                alert('Image attachment feature would open here');
            });
        }

        const attachFile = document.getElementById('attach-file');
        if (attachFile) {
            attachFile.addEventListener('click', function() {
                alert('File attachment feature would open here');
            });
        }
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const messages = document.querySelector('.chat-messages');
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
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
            simulatePatientReply();
        }, 1000);
    }
}

function simulatePatientReply() {
    const messages = document.querySelector('.chat-messages');
    const replies = [
        "Thanks for your message! I'll follow your advice.",
        "That makes sense. I'll adjust my diet accordingly.",
        "I have a question about the meal plan for tomorrow.",
        "I'm feeling much better with the current diet, thank you!",
        "Can you suggest an alternative for the breakfast option?"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    if (messages) {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'message received';
        replyDiv.innerHTML = `
            <p>${randomReply}</p>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messages.appendChild(replyDiv);
        messages.scrollTop = messages.scrollHeight;
    }
}

function setupForms() {
    console.log('🔧 Setting up forms...');
const dietForm = document.getElementById('dietPlanForm');
if (dietForm) {
    dietForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const patientSelect = document.getElementById('patientSelect');
        const planName = document.getElementById('planName').value;
        
        if (!patientSelect.value) {
            alert('Please select a patient first.');
            return;
        }
        
        const planData = {
            planName: planName,
            duration: document.getElementById('planDuration').value,
            calorieTarget: document.getElementById('calorieTarget').value,
            breakfast: document.getElementById('breakfast').value,
            lunch: document.getElementById('lunch').value,
            dinner: document.getElementById('dinner').value,
            snacks: document.getElementById('snacks').value,
            nutritionistId: auth.currentUser.uid,
            nutritionistName: this.currentUserData?.name || 'Nutritionist',
            createdAt: new Date(),
            status: 'active'
        };

        try {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            await setDoc(doc(db, 'dietPlans', patientSelect.value), planData);
            
            alert(`Diet plan "${planName}" created successfully for patient!`);
            this.reset();
            
        } catch (error) {
            console.error('Error creating diet plan:', error);
            alert('Error creating diet plan. Please try again.');
        }
    });
}
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                specialization: document.getElementById('specialization').value,
                phone: document.getElementById('phone').value,
                updatedAt: new Date().toISOString()
            };

            try {
                const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
                await updateDoc(doc(db, 'users', auth.currentUser.uid), formData);
                updateDashboardUI(formData);
                
                alert('Profile updated successfully!');
                
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Error updating profile. Please try again.');
            }
        });
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
    
    const rescheduleBtn = document.getElementById('reschedule-session');
    if (rescheduleBtn) {
        rescheduleBtn.addEventListener('click', function() {
            alert('Opening rescheduling options...');
        });
    }
    
    const writeReviewBtn = document.getElementById('write-review-btn');
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            alert('Review form would open here');
        });
    }
    
    const loadMoreReviews = document.getElementById('load-more-reviews');
    if (loadMoreReviews) {
        loadMoreReviews.addEventListener('click', function() {
            alert('Loading more reviews...');
        });
    }

    document.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.classList.contains('btn') && !target.classList.contains('btn-outline') && target.textContent.includes('View Progress')) {
            e.preventDefault();
            const patientCard = target.closest('.patient-card');
            const patientName = patientCard ? patientCard.querySelector('h3').textContent : 'Patient';
            alert(`Showing progress for ${patientName}`);
            switchToSection('progress');
        }
        
        if (target.classList.contains('btn-outline') && target.textContent.includes('Message')) {
            e.preventDefault();
            const patientCard = target.closest('.patient-card');
            const patientName = patientCard ? patientCard.querySelector('h3').textContent : 'Patient';
            alert(`Opening chat with ${patientName}`);
            switchToSection('messages');
        }
        
        if (target.classList.contains('btn-outline') && target.textContent.includes('Diet Plan')) {
            e.preventDefault();
            const patientCard = target.closest('.patient-card');
            const patientName = patientCard ? patientCard.querySelector('h3').textContent : 'Patient';
            alert(`Creating diet plan for ${patientName}`);
            switchToSection('diet-plans');
        }
    });
}

function switchToSection(sectionId) {
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function setupLogout() {
    console.log('🔧 Setting up logout...');
    
    const sidebar = document.querySelector('.sidebar-menu');
    if (sidebar && !document.getElementById('logoutBtn')) {
        const logoutItem = document.createElement('li');
        logoutItem.innerHTML = `
            <a href="#" id="logoutBtn" style="color: #e74c3c;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;
        sidebar.appendChild(logoutItem);
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = "../login.html";
            }).catch((error) => {
                console.error('Logout error:', error);
            });
        });
    }
}

window.viewPatientProgress = function(patientId) {
    alert('Viewing progress for patient: ' + patientId);
    switchToSection('progress');
};

window.messagePatient = function(patientId) {
    alert('Messaging patient: ' + patientId);
    switchToSection('messages');
};

window.createDietPlan = function(patientId) {
    alert('Creating diet plan for patient: ' + patientId);
    switchToSection('diet-plans');
    
    const patientSelect = document.getElementById('patientSelect');
    if (patientSelect) {
        patientSelect.value = patientId;
    }
};

async function setupRealTimePatients() {
    const { collection, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
    
    const patientsRef = collection(db, 'patients');
    onSnapshot(patientsRef, (snapshot) => {
        const patients = {};
        snapshot.forEach((doc) => {
            patients[doc.id] = doc.data();
        });
        updatePatientsDisplay(patients);
    });
async function loadPendingRequests() {
    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        const requestsRef = collection(db, 'nutritionists', auth.currentUser.uid, 'pendingRequests');
        const snapshot = await getDocs(requestsRef);
        
        const requestsContainer = document.getElementById('pending-requests');
        if (!requestsContainer) return;
        
        if (snapshot.empty) {
            requestsContainer.innerHTML = '<p>No pending requests</p>';
            return;
        }
        
        requestsContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const request = doc.data();
            const requestElement = document.createElement('div');
            requestElement.className = 'pending-request';
            requestElement.innerHTML = `
                <div class="request-info">
                    <h4>${request.patientName}</h4>
                    <p>Email: ${request.patientEmail}</p>
                    <p>Requested: ${new Date(request.requestedAt).toLocaleDateString()}</p>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success" onclick="approvePatientRequest('${request.patientId}', '${request.patientName}')">Approve</button>
                    <button class="btn btn-danger" onclick="rejectPatientRequest('${request.patientId}')">Reject</button>
                </div>
            `;
            requestsContainer.appendChild(requestElement);
        });
        
    } catch (error) {
        console.error('Error loading pending requests:', error);
    }
}

window.approvePatientRequest = async function(patientId, patientName) {
    try {
        const { doc, updateDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        await updateDoc(doc(db, 'patients', patientId), {
            status: 'approved',
            assignmentStatus: 'approved',
            approvedAt: new Date().toISOString()
        });
        
        await deleteDoc(doc(db, 'nutritionists', auth.currentUser.uid, 'pendingRequests', patientId));
        
        alert(`Patient ${patientName} approved successfully!`);
        
        setupRealTimePatients();
        loadPendingRequests();
        
    } catch (error) {
        console.error('Error approving patient:', error);
        alert('Error approving patient request.');
    }
};

    window.rejectPatientRequest = async function(patientId) {
    try {
        const { doc, updateDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        await updateDoc(doc(db, 'patients', patientId), {
            status: 'rejected',
            assignmentStatus: 'rejected'
        });
        
        await deleteDoc(doc(db, 'nutritionists', auth.currentUser.uid, 'pendingRequests', patientId));
        
        alert('Patient request rejected.');
        
        loadPendingRequests();
        
    } catch (error) {
        console.error('Error rejecting patient:', error);
        alert('Error rejecting patient request.');
    }
   };
}

function updatePatientsDisplay(patients) {
    const patientsGrid = document.querySelector('#patients .patients-grid');
    if (!patientsGrid) return;

    patientsGrid.innerHTML = '';

    Object.entries(patients).forEach(([patientId, patientData]) => {
        
        if (patientData.assignedNutritionist === auth.currentUser.uid) {
            const initials = patientData.name ? patientData.name.split(' ').map(n => n[0]).join('') : 'PT';
            
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            patientCard.innerHTML = `
                <div class="patient-header">
                    <div class="patient-avatar">${initials}</div>
                    <div class="patient-info">
                        <h3>${patientData.name || 'Unknown Patient'}</h3>
                        <p>Age: ${patientData.age || 'N/A'} | Weight: ${patientData.weight || 'N/A'}</p>
                        <p>Goal: ${patientData.fitnessGoal || 'Not specified'}</p>
                    </div>
                </div>
                <div class="patient-body">
                    <div class="patient-stats">
                        <div class="stat">
                            <span class="stat-value">${patientData.adherence || '0'}%</span>
                            <span class="stat-label">Adherence</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${patientData.progress || '0'}</span>
                            <span class="stat-label">Progress</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${patientData.daysFollowing || '0'}</span>
                            <span class="stat-label">Days</span>
                        </div>
                    </div>
                    <div class="patient-actions">
                        <button class="btn" onclick="viewPatientProgress('${patientId}')">View Progress</button>
                        <button class="btn btn-outline" onclick="messagePatient('${patientId}')">Message</button>
                        <button class="btn btn-outline" onclick="createDietPlan('${patientId}')">Diet Plan</button>
                    </div>
                </div>
            `;
            patientsGrid.appendChild(patientCard);
        }
    });
    if (patientsGrid.children.length === 0) {
        patientsGrid.innerHTML = `
            <div class="no-patients">
                <p>No patients assigned to you yet.</p>
                <p><small>Patients will appear here once they are assigned to you.</small></p>
            </div>
        `;
    }
}
setupRealTimePatients();