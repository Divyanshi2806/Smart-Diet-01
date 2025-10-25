const appData = {
    patient: {
        name: "Deep Kumar",
        status: "Patient",
        avatar: "https://icones.pro/wp-content/uploads/2022/07/icones-d-administration-vert.png"
    },

    tabs: [
        { id: "diet-plan", icon: "fas fa-utensils", label: "Diet Plan" },
        { id: "chat", icon: "fas fa-comments", label: "Chat" },
        { id: "progress", icon: "fas fa-chart-line", label: "Progress" },
        { id: "nutritionist", icon: "fas fa-user-md", label: "Nutritionist" }
    ],

    // Diet Plan Data
    dietPlan: {
        periods: ["Daily", "Weekly", "Monthly"],
        meals: [
            {
                type: "breakfast",
                icon: "fas fa-sun",
                time: "8:00 AM",
                name: "Oatmeal with Berries & Almonds",
                description: "High-fiber oatmeal topped with fresh berries and a sprinkle of almonds for healthy fats.",
                nutrition: { calories: 350, protein: "12g", fat: "8g", fiber: "10g" },
                notes: "Remember to drink a glass of water before eating. This meal will provide sustained energy throughout the morning."
            },
            {
                type: "lunch",
                icon: "fas fa-sun",
                time: "1:00 PM",
                name: "Grilled Chicken Salad",
                description: "Mixed greens with grilled chicken, cherry tomatoes, cucumbers, and light vinaigrette.",
                nutrition: { calories: 420, protein: "35g", fat: "15g", fiber: "8g" },
                notes: "Add a squeeze of lemon for extra flavor. This protein-rich meal will keep you full until dinner."
            },
            {
                type: "dinner",
                icon: "fas fa-moon",
                time: "7:00 PM",
                name: "Baked Salmon with Quinoa",
                description: "Salmon fillet with lemon herb seasoning, served with quinoa and steamed vegetables.",
                nutrition: { calories: 480, protein: "38g", fat: "22g", fiber: "7g" },
                notes: "Omega-3 fatty acids in salmon support heart health. Try to finish dinner at least 3 hours before bedtime."
            }
        ]
    },

    // Chat Data
    chat: {
        nutritionist: {
            name: "Dr. Wilson",
            status: "online",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
        },
        messages: [
            {
                sender: "nutritionist",
                text: "Hi Deeph! How are you feeling with the new diet plan?",
                time: "10:30 AM"
            },
            {
                sender: "patient",
                text: "It's going well! The breakfast keeps me full until lunch, which is great.",
                time: "10:32 AM"
            },
            {
                sender: "nutritionist",
                text: "That's excellent to hear! Remember to stay hydrated throughout the day.",
                time: "10:35 AM"
            }
        ]
    },

    // Progress Data
    progress: {
        summary: {
            streak: 12,
            goals: 5
        },
        charts: [
            { id: "weight-chart", title: "Weight Progress" },
            { id: "calorie-chart", title: "Calorie Intake" },
            { id: "hydration-chart", title: "Hydration" }
        ],
        badges: [
            { icon: "fas fa-trophy", label: "First Week" },
            { icon: "fas fa-apple-alt", label: "Healthy Eating" },
            { icon: "fas fa-weight", label: "5 lbs Down" },
            { icon: "fas fa-glass-water", label: "Hydration Master" }
        ]
    },

    // Nutritionist Data
    nutritionist: {
        profile: {
            name: "Dr. Michael Wilson, RD",
            specialization: "Clinical Nutrition Specialist",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
            rating: 4.7,
            reviews: 128
        },
        qualifications: [
            "Registered Dietitian (RD)",
            "Master of Science in Nutrition",
            "Certified Diabetes Educator",
            "10+ years of experience"
        ],
        specializations: [
            "Weight Management",
            "Diabetes Nutrition",
            "Sports Nutrition",
            "Heart Health"
        ],
        availability: [
            { days: "Mon, Wed, Fri", time: "9:00 AM - 5:00 PM" },
            { days: "Tue, Thu", time: "10:00 AM - 6:00 PM" }
        ],
        contact: {
            email: "dr.wilson@smartdiet.com",
            phone: "(555) 123-4567"
        },
        nextSession: {
            date: "15",
            month: "Nov",
            title: "Monthly Check-in",
            time: "2:00 PM - 2:45 PM",
            type: "Video Call"
        },
        reviews: {
            overall: 4.7,
            total: 128,
            userReview: {
                exists: true,
                rating: 5,
                
            },
            otherReviews: [
                {
                    name: "John Doe",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
                    rating: 5,
                    title: "Excellent guidance and support",
                    content: "Dr. Wilson provided exceptional guidance throughout my weight loss journey. His meal plans are practical and easy to follow. The regular check-ins kept me motivated.",
                    date: "October 28, 2023"
                },
                {
                    name: "Emily Chen",
                    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
                    rating: 4,
                    title: "Very knowledgeable and patient",
                    content: "Dr. Wilson helped me manage my diabetes through proper nutrition. He's very knowledgeable and took time to answer all my questions. Would recommend!",
                    date: "October 15, 2023"
                }
            ]
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = appData;
}