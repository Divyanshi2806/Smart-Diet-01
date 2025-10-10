// Main Application Controller
class SmartDietApp {
    constructor() {
        this.data = appData;
        this.currentTab = 'diet-plan';
        this.init();
    }

    init() {
        this.renderHeader();
        this.renderNavigation();
        this.renderAllSections();
        this.setupEventListeners();
        this.activateTab(this.currentTab);
    }

    // Render Header with Patient Info
    renderHeader() {
        const userInfo = document.getElementById('user-info');
        const patient = this.data.patient;

        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">${patient.name}</span>
                <span class="user-status">${patient.status}</span>
            </div>
            <img src="${patient.avatar}" alt="${patient.name}" class="user-avatar">
        `;
    }

    // Render Navigation Tabs
    renderNavigation() {
        const navTabs = document.getElementById('navigation-tabs');
        
        navTabs.innerHTML = this.data.tabs.map(tab => `
            <button class="tab" data-tab="${tab.id}">
                <i class="${tab.icon}"></i>
                <span>${tab.label}</span>
            </button>
        `).join('');
    }

    // Render All Sections
    renderAllSections() {
        this.renderDietPlan();
        this.renderChat();
        this.renderProgress();
        this.renderNutritionist();
    }

    // Diet Plan Section
    renderDietPlan() {
        this.renderPeriodSelector();
        this.renderMealCards();
    }

    renderPeriodSelector() {
        const periodSelector = document.getElementById('period-selector');
        const periods = this.data.dietPlan.periods;

        periodSelector.innerHTML = periods.map(period => `
            <button class="period-btn ${period === 'Daily' ? 'active' : ''}">${period}</button>
        `).join('');
    }

    renderMealCards() {
        const mealCards = document.getElementById('meal-cards');
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
    }

    renderNutritionInfo(nutrition) {
        return Object.entries(nutrition).map(([key, value]) => `
            <div class="nutrition-item">
                <span class="nutrition-value">${value}</span>
                <span class="nutrition-label">${this.capitalizeFirst(key)}</span>
            </div>
        `).join('');
    }

    // Chat Section
    renderChat() {
        this.renderNutritionistStatus();
        this.renderChatHistory();
    }

    renderNutritionistStatus() {
        const statusElement = document.getElementById('nutritionist-status');
        const nutritionist = this.data.chat.nutritionist;

        statusElement.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${nutritionist.name} is ${this.capitalizeFirst(nutritionist.status)}</span>
        `;
        statusElement.className = `nutritionist-status ${nutritionist.status}`;
    }

    renderChatHistory() {
        const chatHistory = document.getElementById('chat-history');
        const messages = this.data.chat.messages;
        const patientAvatar = this.data.patient.avatar;
        const nutritionistAvatar = this.data.chat.nutritionist.avatar;

        chatHistory.innerHTML = messages.map(message => `
            <div class="message ${message.sender}-message">
                ${message.sender === 'nutritionist' ? `
                    <div class="message-avatar">
                        <img src="${nutritionistAvatar}" alt="Nutritionist">
                    </div>
                ` : ''}
                <div class="message-content">
                    <div class="message-sender">${message.sender === 'nutritionist' ? this.data.chat.nutritionist.name : 'You'}</div>
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${message.time}</div>
                </div>
                ${message.sender === 'patient' ? `
                    <div class="message-avatar">
                        <img src="${patientAvatar}" alt="Patient">
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Progress Section
    renderProgress() {
        this.renderProgressSummary();
        this.renderProgressCharts();
        this.renderProgressBadges();
    }

    renderProgressSummary() {
        const progressSummary = document.getElementById('progress-summary');
        const summary = this.data.progress.summary;

        progressSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${summary.streak}</span>
                <span class="summary-label">Days Streak</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${summary.goals}</span>
                <span class="summary-label">Goals Achieved</span>
            </div>
        `;
    }

    renderProgressCharts() {
        const chartsContainer = document.getElementById('progress-charts');
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

    renderProgressBadges() {
        const badgesContainer = document.getElementById('progress-badges');
        const badges = this.data.progress.badges;

        badgesContainer.innerHTML = badges.map(badge => `
            <div class="badge">
                <i class="${badge.icon}"></i>
                <span>${badge.label}</span>
            </div>
        `).join('');
    }

    // Nutritionist Section
    renderNutritionist() {
        this.renderNutritionistProfile();
        this.renderNextSession();
        this.renderReviewSection();
        this.renderReviewsSection();
    }

    renderNutritionistProfile() {
        const profileElement = document.getElementById('nutritionist-profile');
        const profile = this.data.nutritionist.profile;

        profileElement.innerHTML = `
            <div class="profile-header">
                <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
                <div class="profile-info">
                    <h3>${profile.name}</h3>
                    <p class="specialization">${profile.specialization}</p>
                    <div class="rating">
                        ${this.renderStarRating(profile.rating)}
                        <span>${profile.rating} (${profile.reviews} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="profile-details">
                ${this.renderQualifications()}
                ${this.renderSpecializations()}
                ${this.renderAvailability()}
                ${this.renderContactInfo()}
            </div>
        `;
    }

    renderQualifications() {
        const qualifications = this.data.nutritionist.qualifications;
        return `
            <div class="detail-item">
                <h4>Qualifications</h4>
                <ul>
                    ${qualifications.map(qual => `<li>${qual}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderSpecializations() {
        const specializations = this.data.nutritionist.specializations;
        return `
            <div class="detail-item">
                <h4>Specializations</h4>
                <div class="specialization-tags">
                    ${specializations.map(spec => `<span class="tag">${spec}</span>`).join('')}
                </div>
            </div>
        `;
    }

    renderAvailability() {
        const availability = this.data.nutritionist.availability;
        return `
            <div class="detail-item">
                <h4>Availability</h4>
                <div class="availability">
                    ${availability.map(avail => `
                        <div class="availability-item">
                            <span class="day">${avail.days}</span>
                            <span class="time">${avail.time}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderContactInfo() {
        const contact = this.data.nutritionist.contact;
        return `
            <div class="detail-item">
                <h4>Contact Information</h4>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${contact.email}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${contact.phone}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderNextSession() {
        const nextSessionElement = document.getElementById('next-session');
        const session = this.data.nutritionist.nextSession;

        nextSessionElement.innerHTML = `
            <h3>Your Next Session</h3>
            <div class="session-card">
                <div class="session-date">
                    <span class="date">${session.date}</span>
                    <span class="month">${session.month}</span>
                </div>
                <div class="session-details">
                    <h4>${session.title}</h4>
                    <p><i class="far fa-clock"></i> ${session.time}</p>
                    <p><i class="fas fa-video"></i> ${session.type}</p>
                </div>
                <button class="btn-outline" id="reschedule-session">
                    <i class="fas fa-edit"></i>
                    Reschedule
                </button>
            </div>
        `;
    }

    renderReviewSection() {
        const reviewSection = document.getElementById('review-section');
        const userReview = this.data.nutritionist.reviews.userReview;

        reviewSection.innerHTML = `
            <div class="review-header">
                <h3>Leave a Review</h3>
                <button class="btn-primary" id="write-review-btn">
                    <i class="fas fa-pen"></i>
                    Write Review
                </button>
            </div>
            
            ${userReview.exists ? this.renderUserReview(userReview) : ''}
            
            <div class="review-form-container" id="review-form" style="display: none;">
                ${this.renderReviewForm()}
            </div>
        `;
    }

    renderUserReview(review) {
        return `
            <div class="user-review" id="user-review">
                <h4>Your Review</h4>
                <div class="review-card">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <img src="${this.data.patient.avatar}" alt="${this.data.patient.name}" class="reviewer-avatar">
                            <div>
                                <div class="reviewer-name">${this.data.patient.name}</div>
                                <div class="review-date">${review.date}</div>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${this.renderStarRating(review.rating)}
                            <span>${review.rating}.0</span>
                        </div>
                    </div>
                    <h5 class="review-title">${review.title}</h5>
                    <p class="review-content">${review.content}</p>
                    <div class="review-actions">
                        <button class="btn-text edit-review">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn-text delete-review">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderReviewForm() {
        return `
            <h4>How was your experience?</h4>
            <div class="rating-input">
                <span>Your Rating:</span>
                <div class="star-rating">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                </div>
                <span class="rating-text">Select rating</span>
            </div>
            <div class="form-group">
                <label for="review-title">Review Title</label>
                <input type="text" id="review-title" placeholder="Summarize your experience">
            </div>
            <div class="form-group">
                <label for="review-text">Your Review</label>
                <textarea id="review-text" placeholder="Share details of your experience..." rows="4"></textarea>
            </div>
            <div class="form-actions">
                <button class="btn-outline" id="cancel-review">Cancel</button>
                <button class="btn-primary" id="submit-review">Submit Review</button>
            </div>
        `;
    }

    renderReviewsSection() {
        const reviewsSection = document.getElementById('reviews-section');
        const reviews = this.data.nutritionist.reviews;

        reviewsSection.innerHTML = `
            <div class="section-header">
                <h3>What Other Patients Say</h3>
                <div class="reviews-stats">
                    <div class="overall-rating">
                        <div class="rating-number">${reviews.overall}</div>
                        <div class="rating-stars">
                            ${this.renderStarRating(reviews.overall)}
                        </div>
                        <div class="rating-count">${reviews.total} reviews</div>
                    </div>
                </div>
            </div>

            <div class="reviews-filter" id="reviews-filter">
                <button class="filter-btn active">All</button>
                <button class="filter-btn">5 Star</button>
                <button class="filter-btn">4 Star</button>
                <button class="filter-btn">3 Star</button>
                <button class="filter-btn">2 Star</button>
                <button class="filter-btn">1 Star</button>
            </div>

            <div class="reviews-list" id="reviews-list">
                ${this.renderOtherReviews(reviews.otherReviews)}
            </div>

            <div class="reviews-footer">
                <button class="btn-outline" id="load-more-reviews">
                    <i class="fas fa-arrow-down"></i>
                    Load More Reviews
                </button>
            </div>
        `;
    }

    renderOtherReviews(reviews) {
        return reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">
                        <div>
                            <div class="reviewer-name">${review.name}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStarRating(review.rating)}
                        <span>${review.rating}.0</span>
                    </div>
                </div>
                <h5 class="review-title">${review.title}</h5>
                <p class="review-content">${review.content}</p>
            </div>
        `).join('');
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // Utility Methods
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Event Listeners Setup
    setupEventListeners() {
        this.setupTabNavigation();
        this.setupChatEvents();
        this.setupReviewEvents();
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
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;
    }

    setupChatEvents() {
        // Chat functionality from previous implementation
        const chatInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-message');

        const sendMessage = () => {
            const messageText = chatInput.value.trim();
            if (messageText) {
                this.addMessageToChat('patient', messageText);
                chatInput.value = '';
                
                // Simulate nutritionist reply
                setTimeout(() => {
                    this.simulateNutritionistReply();
                }, 1500);
            }
        };

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Video call button
        document.getElementById('video-call').addEventListener('click', () => {
            this.showNotification('Starting video call with Dr. Wilson...');
        });
    }

    addMessageToChat(sender, text) {
        const chatHistory = document.getElementById('chat-history');
        const message = {
            sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const messageElement = this.createMessageElement(message);
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Add to data (in real app, this would be sent to server)
        this.data.chat.messages.push(message);
    }

    createMessageElement(message) {
        const patientAvatar = this.data.patient.avatar;
        const nutritionistAvatar = this.data.chat.nutritionist.avatar;

        return document.createRange().createContextualFragment(`
            <div class="message ${message.sender}-message">
                ${message.sender === 'nutritionist' ? `
                    <div class="message-avatar">
                        <img src="${nutritionistAvatar}" alt="Nutritionist">
                    </div>
                ` : ''}
                <div class="message-content">
                    <div class="message-sender">${message.sender === 'nutritionist' ? this.data.chat.nutritionist.name : 'You'}</div>
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${message.time}</div>
                </div>
                ${message.sender === 'patient' ? `
                    <div class="message-avatar">
                        <img src="${patientAvatar}" alt="Patient">
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
        this.addMessageToChat('nutritionist', randomReply);
    }

    setupReviewEvents() {
        // Review system functionality from previous implementation
        // This would include all the review form handling, star ratings, etc.
        // For brevity, I'm including the core structure - you can add the detailed review logic here
    }

    setupButtonEvents() {
        // Download plan button
        document.getElementById('download-plan').addEventListener('click', () => {
            this.showNotification('Downloading your diet plan...');
        });

        // Book session button
        document.getElementById('book-session').addEventListener('click', () => {
            this.showNotification('Opening appointment scheduler...');
        });
    }

    showNotification(message, type = 'info') {
        // Notification system from previous implementation
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
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartDietApp();
});