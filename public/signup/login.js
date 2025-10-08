// Firebase imports and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Your Firebase configuration
// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU_XqW-FuNivXUYuDHY8fG2-FFxP_yUb4",
  authDomain: "smart-diet-5706d.firebaseapp.com",
  databaseURL: "https://smart-diet-5706d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-diet-5706d",
  storageBucket: "smart-diet-5706d.firebasestorage.app",
  messagingSenderId: "659505981433",
  appId: "1:659505981433:web:95fc252458e5a4e1ee7f28",
  measurementId: "G-QFXFE3YF0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Main application logic
class AuthApp {
  constructor() {
    this.currentRole = 'doctor';
    this.currentAction = 'login';
    this.init();
  }

  init() {
    console.log('🚀 AuthApp initialized');
    this.bindEvents();
    this.updateFormDisplay();
  }

  bindEvents() {
    // Role selection
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🎯 Role card clicked:', card.dataset.role);
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentRole = card.dataset.role;
        this.updateFormDisplay();
      });
    });

    // Auth toggle (Login/Signup)
    document.querySelectorAll('.toggle-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 Toggle option clicked:', option.dataset.action);
        document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.currentAction = option.dataset.action;
        this.updateFormDisplay();
      });
    });

    // Auth links inside forms
    document.querySelectorAll('.auth-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔗 Auth link clicked:', link.dataset.action);
        this.currentAction = link.dataset.action;
        document.querySelectorAll('.toggle-option').forEach(o => {
          o.classList.remove('active');
          if (o.dataset.action === this.currentAction) o.classList.add('active');
        });
        this.updateFormDisplay();
      });
    });

    // Password visibility toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const input = toggle.previousElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          toggle.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          toggle.classList.remove('fa-eye-slash');
        }
      });
    });

    // Signup forms
    this.setupSignupForms();
    
    // Login forms
    this.setupLoginForms();
  }

  updateFormDisplay() {
    // Hide all form pages
    document.querySelectorAll('.form-page').forEach(page => {
      page.classList.remove('active');
    });

    // Show the current form page
    const currentFormId = `${this.currentRole}-${this.currentAction}`;
    const currentForm = document.getElementById(currentFormId);
    
    if (currentForm) {
      console.log('👁️ Showing form:', currentFormId);
      currentForm.classList.add('active');
    } else {
      console.error('❌ Form not found:', currentFormId);
    }
  }

  setupSignupForms() {
    const signupForms = {
      doctor: document.getElementById('doctor-signup-form'),
      patient: document.getElementById('patient-signup-form'),
      user: document.getElementById('user-signup-form')
    };

    Object.keys(signupForms).forEach(role => {
      const form = signupForms[role];
      if (form) {
        form.addEventListener('submit', (e) => this.handleSignup(e, role, form));
      }
    });
  }

  setupLoginForms() {
    const loginForms = {
      doctor: document.getElementById('doctor-login-form'),
      patient: document.getElementById('patient-login-form'),
      user: document.getElementById('user-login-form')
    };

    Object.keys(loginForms).forEach(role => {
      const form = loginForms[role];
      if (form) {
        form.addEventListener('submit', (e) => this.handleLogin(e, role, form));
      }
    });
  }

  handleSignup(e, role, form) {
    e.preventDefault();
    console.log(`🎉 === Starting SIGNUP for: ${role} ===`);
    
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

    console.log('📧 Email:', email);
    console.log('🎭 Role:', role);

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // Collect all input/select values
    const userData = {};
    form.querySelectorAll('input, select').forEach(el => {
      if (el.type !== 'password' && el.type !== 'checkbox' && el.id) {
        const fieldName = el.id.replace(`${role}-signup-`, '');
        userData[fieldName] = el.value.trim();
      }
    });
    userData.role = role;
    userData.createdAt = new Date().toISOString();

    console.log('💾 User data to save:', userData);

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('✅ Firebase user created. UID:', user.uid);
        
        return set(ref(database, 'users/' + user.uid), userData)
          .then(() => {
            console.log('✅ User data saved to database');
            console.log('🔄 Calling redirectToDashboard for role:', role);
            alert("Account created successfully! Redirecting to your dashboard...");
            this.redirectToDashboard(role);
          });
      })
      .catch(error => {
        console.error("❌ Signup error:", error);
        let errorMessage = "Signup failed. ";
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage += "This email is already registered.";
            break;
          case 'auth/invalid-email':
            errorMessage += "Invalid email address.";
            break;
          case 'auth/weak-password':
            errorMessage += "Password is too weak.";
            break;
          default:
            errorMessage += error.message;
        }
        
        alert(errorMessage);
      });
  }

  async handleLogin(e, role, form) {
    e.preventDefault();
    console.log(`🔐 === Starting LOGIN for: ${role} ===`);

    const inputValue = form.querySelector('input[type="text"], input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    console.log('📝 Input value:', inputValue);
    console.log('🎭 Role:', role);

    if (!inputValue || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      let emailToLogin = inputValue;

      // Doctor login with Medical ID or email
      if (role === 'doctor') {
        console.log('🩺 Doctor login - checking medical ID...');
        const dbRef = ref(database, 'users');
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          let foundByMedicalId = false;
          
          for (let uid in users) {
            const user = users[uid];
            if (user.role === 'doctor' && user.medid === inputValue) {
              emailToLogin = user.email;
              foundByMedicalId = true;
              console.log('✅ Found doctor by medical ID. Email:', emailToLogin);
              break;
            }
          }
        }
      }

      console.log('🔑 Attempting login with:', emailToLogin);
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
      console.log('✅ Login successful for user:', userCredential.user.uid);
      console.log('🔄 Calling redirectToDashboard for role:', role);
      this.redirectToDashboard(role);

    } catch (err) {
      console.error("❌ Login error:", err);
      
      if (err.code === 'auth/user-not-found') {
        alert("No account found with these credentials.");
      } else if (err.code === 'auth/wrong-password') {
        alert("Incorrect password.");
      } else {
        alert("Login failed: " + err.message);
      }
    }
  }

  redirectToDashboard(role) {
    console.log('🎯 === redirectToDashboard CALLED ===');
    console.log('🎭 Role:', role);
    
    let redirectUrl = '';
    if (role === 'doctor') {
      redirectUrl = "doctor/doctor-dashboard.html";
    } else if (role === 'patient') {
      redirectUrl = "patient/patient-dashboard.html";
    } else {
      redirectUrl = "user/user-dashboard.html";
    }
    
    console.log('📍 Redirect URL:', redirectUrl);
    console.log('⏳ Waiting 1 second before redirect...');
    
    // Add a small delay to ensure everything is processed
    setTimeout(() => {
      console.log('🚀 EXECUTING REDIRECT to:', redirectUrl);
      window.location.href = redirectUrl;
    }, 1000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM Content Loaded - Initializing AuthApp...');
  new AuthApp();
});