// Tab navigation
const menuItems = document.querySelectorAll('.sidebar-menu a');
const contentSections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all menu items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Hide all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Show selected content section
        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Chat functionality
const chatInput = document.querySelector('#messageInput');
const chatSendBtn = document.querySelector('#sendMessage');
const chatMessages = document.querySelector('.chat-messages');

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const messageText = chatInput.value.trim();
    
    if (messageText) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <p>${messageText}</p>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate reply after a delay
        setTimeout(() => {
            const replyElement = document.createElement('div');
            replyElement.className = 'message received';
            replyElement.innerHTML = `
                <p>Thanks for your message. I'll follow your advice.</p>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            chatMessages.appendChild(replyElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
}

// Chat item selection
const chatItems = document.querySelectorAll('.chat-item');
chatItems.forEach(item => {
    item.addEventListener('click', () => {
        chatItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // In a real app, this would load the conversation for the selected patient
        const patientName = item.querySelector('h4').textContent;
        document.querySelector('.chat-messages').innerHTML = `
            <div class="message received">
                <p>Hello! I have a question about my diet plan.</p>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
    });
});

// Diet Plan Form Submission
const dietPlanForm = document.getElementById('dietPlanForm');
dietPlanForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const patient = document.getElementById('patientSelect').value;
    const planName = document.getElementById('planName').value;
    
    if (patient && planName) {
        alert(`Diet plan "${planName}" created successfully for ${document.getElementById('patientSelect').options[document.getElementById('patientSelect').selectedIndex].text}!`);
        dietPlanForm.reset();
    }
});

// Settings Form Submission
const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Profile updated successfully!');
});

// Simulate loading patients data
document.addEventListener('DOMContentLoaded', function() {
    // This would typically be an API call in a real application
    const patientsData = [
        { name: "Vijay Singh", age: 32, weight: "68kg", adherence: "85%", loss: "-3kg", days: 12 },
        { name: "Neha Patel", age: 45, weight: "92kg", adherence: "72%", loss: "-5kg", days: 24 },
        { name: "Vidhi Prajapati", age: 28, weight: "58kg", adherence: "91%", gain: "+1kg", days: 18 },
        { name: "Sunil Kumar", age: 52, weight: "105kg", adherence: "68%", loss: "-7kg", days: 36 }
    ];
    
    const patientsGrid = document.querySelector('#patients .patients-grid');
    
    patientsData.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        
        const initials = patient.name.split(' ').map(n => n[0]).join('');
        
        patientCard.innerHTML = `
            <div class="patient-header">
                <div class="patient-avatar">${initials}</div>
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>Age: ${patient.age} | Weight: ${patient.weight}</p>
                </div>
            </div>
            <div class="patient-body">
                <div class="patient-stats">
                    <div class="stat">
                        <span class="stat-value">${patient.adherence}</span>
                        <span class="stat-label">Adherence</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${patient.loss || patient.gain}</span>
                        <span class="stat-label">${patient.loss ? 'Weight Loss' : 'Muscle Gain'}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${patient.days}</span>
                        <span class="stat-label">Days</span>
                    </div>
                </div>
                <div class="patient-actions">
                    <a href="#" class="btn">View Progress</a>
                    <a href="#" class="btn btn-outline">Message</a>
                </div>
            </div>
        `;
        
        patientsGrid.appendChild(patientCard);
    });
    
    // Add event listeners to patient action buttons
    document.querySelectorAll('.patient-actions .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const patientCard = this.closest('.patient-card');
            const patientName = patientCard.querySelector('.patient-info h3').textContent;
            
            if (this.classList.contains('btn-outline')) {
                // Message button clicked
                alert(`Opening chat with ${patientName}`);
            } else {
                // View Progress button clicked
                alert(`Showing progress for ${patientName}`);
            }
        });
    });
});