import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };

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
    this.loadNutritionistsForSelection();
  }

  bindEvents() {
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

    this.setupSignupForms();
    this.setupLoginForms();
  }

  updateFormDisplay() {
    document.querySelectorAll('.form-page').forEach(page => {
      page.classList.remove('active');
    });
    const currentFormId = `${this.currentRole}-${this.currentAction}`;
    const currentForm = document.getElementById(currentFormId);
    
    if (currentForm) {
      console.log('👁️ Showing form:', currentFormId);
      currentForm.classList.add('active');

      if (currentFormId === 'patient-signup') {
        this.loadNutritionistsForSelection();
      }
    } else {
      console.error('❌ Form not found:', currentFormId);
    }
  }

  async loadNutritionistsForSelection() {
    try {
        console.log('🔍 Loading nutritionists from Firestore...');
        
        const nutritionistsRef = collection(firestore, 'users');
        const snapshot = await getDocs(nutritionistsRef);
        
        const selectElement = document.getElementById('patient-signup-nutritionist');
        if (!selectElement) {
            console.log('❌ Nutritionist select element not found');
            return;
        }
        
        selectElement.innerHTML = '<option value="">Choose a nutritionist...</option>';
        
        let nutritionistCount = 0;
        
        snapshot.forEach((doc) => {
            const userData = doc.data();
            console.log('👨‍⚕️ Found user:', userData.role, userData.verificationStatus, userData.name);
            
            if (userData.role === 'doctor' && userData.verificationStatus === 'verified') {
                const option = document.createElement('option');
                option.value = doc.id; // Nutritionist's user ID
                option.textContent = `${userData.name || 'Nutritionist'} - ${userData.specialization || 'Certified Nutritionist'}`;
                selectElement.appendChild(option);
                nutritionistCount++;
                console.log('✅ Added nutritionist:', userData.name);
            }
        });
        
        console.log(`✅ Loaded ${nutritionistCount} nutritionists for selection`);
        
        if (nutritionistCount === 0) {
            selectElement.innerHTML = '<option value="">No verified nutritionists available</option>';
            console.log('⚠️ No verified nutritionists found');
        }
        
    } catch (error) {
        console.error('❌ Error loading nutritionists:', error);
        
        const selectElement = document.getElementById('patient-signup-nutritionist');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Error loading nutritionists</option>';
        }
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

  async handleSignup(e, role, form) {
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

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const userData = {};
    form.querySelectorAll('input, select').forEach(el => {
      if (el.type !== 'password' && el.type !== 'checkbox' && el.id) {
        const fieldName = el.id.replace(`${role}-signup-`, '');
        userData[fieldName] = el.value.trim();
      }
    });
    
    userData.role = role;
    userData.email = email;
    userData.createdAt = new Date().toISOString();
    
    if (role === 'doctor') {
      userData.verificationStatus = 'pending';
      userData.documentsUploaded = false;
    }
    
    if (role === 'patient') {
      const nutritionistSelect = form.querySelector('#patient-signup-nutritionist');
      if (nutritionistSelect && nutritionistSelect.value) {
        userData.requestedNutritionist = nutritionistSelect.value;
        userData.assignmentStatus = 'pending';
        console.log('✅ Patient selected nutritionist:', nutritionistSelect.value);
      }
    }

    console.log('💾 User data to save:', userData);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase user created. UID:', user.uid);
      
      await setDoc(doc(firestore, 'users', user.uid), userData);
      console.log('✅ User data saved to Firestore');

if (role === 'patient') {
    const nutritionistSelect = form.querySelector('#patient-signup-nutritionist');
    const selectedNutritionistId = nutritionistSelect ? nutritionistSelect.value : '';
    
    if (!selectedNutritionistId) {
        alert("Please select a nutritionist!");
        return;
    }

    let nutritionistName = 'Nutritionist';
    try {
        const nutritionistDoc = await getDoc(doc(firestore, 'users', selectedNutritionistId));
        if (nutritionistDoc.exists()) {
            nutritionistName = nutritionistDoc.data().name || 'Nutritionist';
        }
    } catch (error) {
        console.error('Error fetching nutritionist name:', error);
    }

    const patientData = {
        userId: user.uid,
        name: userData.name || 'Patient',
        email: email,
        age: userData.age || '',
        phone: userData.phone || '',
        assignedNutritionist: selectedNutritionistId,
        assignedNutritionistName: nutritionistName,
        status: 'pending',
        assignmentStatus: 'pending',
        createdAt: new Date().toISOString(),
        userType: 'patient'
    };
    
    await setDoc(doc(firestore, 'patients', user.uid), patientData);
    
    const requestData = {
        patientId: user.uid,
        patientName: userData.name || 'Patient',
        patientEmail: email,
        requestedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    await setDoc(doc(firestore, 'nutritionists', selectedNutritionistId, 'pendingRequests', user.uid), requestData);
    
    console.log('✅ Patient record created with nutritionist assignment');
    console.log('✅ Nutritionist request created');
    
    alert("Account created successfully! Your nutritionist request has been sent.");
    this.redirectToDashboard(role);
} else {
        if (role === 'doctor') {
          alert("Account created successfully! Please upload your verification documents.");
          window.location.href = "doctor/doctor-dashboard.html";
        } else {
          alert("Account created successfully! Redirecting to your dashboard...");
          this.redirectToDashboard(role);
        }
      }
      
    } catch (error) {
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
    }
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

      if (role === 'doctor') {
        console.log('🩺 Doctor login - checking medical ID...');
        
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("medid", "==", inputValue), where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const userData = doc.data();
          emailToLogin = userData.email;
          console.log('✅ Found doctor by medical ID. Email:', emailToLogin);
        }
      }

      console.log('🔑 Attempting login with:', emailToLogin);
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
      console.log('✅ Login successful for user:', userCredential.user.uid);
      
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
    
    setTimeout(() => {
      console.log('🚀 EXECUTING REDIRECT to:', redirectUrl);
      window.location.href = redirectUrl;
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM Content Loaded - Initializing AuthApp...');
  new AuthApp();
});