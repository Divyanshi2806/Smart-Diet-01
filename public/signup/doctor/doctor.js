// doctor.js - Nutritionist Document Upload with Firestore

let currentUser = null;
let uploadedFiles = {
    certificate: [],
    governmentId: [],
    medicalId: []
};

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDocumentUpload();
});

async function initializeDocumentUpload() {
    console.log('🚀 Initializing nutritionist document upload...');
    
    // Wait for Firebase to be available
    if (!window.firebaseAuth) {
        console.error('Firebase not initialized');
        showStatus('Firebase not loaded. Please refresh the page.', 'error');
        return;
    }

    // Check authentication
    const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { getFirestore, doc, getDoc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
    
    const auth = getAuth();
    const db = getFirestore();
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log('Nutritionist logged in:', user.uid);
            await checkUserVerificationStatus(user.uid, db);
        } else {
            console.log('No user logged in, redirecting to login...');
            window.location.href = "../login.html";
        }
    });

    setupFileUploads();
}

async function checkUserVerificationStatus(userId, db) {
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // If already verified, redirect to dashboard
            if (userData.verificationStatus === 'verified') {
                window.location.href = "nutritionist-dashboard.html";
            }
            // If pending, show pending message
            else if (userData.verificationStatus === 'pending') {
                showStatus('Your documents are under review. Please wait for verification.', 'pending');
                document.getElementById('submitVerification').disabled = true;
                document.getElementById('submitVerification').textContent = 'Verification Pending';
            }
        } else {
            console.log('No user document found in Firestore, will create one on upload');
        }
    } catch (error) {
        console.error('Error checking verification status:', error);
    }
}

// File upload functionality
function setupFileUploads() {
    const fileInputs = document.querySelectorAll('.file-input');
    const submitBtn = document.getElementById('submitVerification');

    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileType = getFileType(input.id);
                const fileId = Date.now();
                
                // Check file size (1MB limit for Base64)
                if (file.size > 1 * 1024 * 1024) {
                    showStatus('File size exceeds 1MB limit. Please choose a smaller file.', 'error');
                    return;
                }
                
                // Check file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    showStatus('Please upload only JPG or PNG files (PDF not supported with Base64).', 'error');
                    return;
                }
                
                // Convert file to Base64
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedFiles[fileType].push({
                        id: fileId,
                        name: file.name,
                        size: formatFileSize(file.size),
                        type: file.type,
                        base64: e.target.result, // This is the Base64 string
                        uploadedAt: new Date().toISOString()
                    });
                    
                    renderUploadedFiles(fileType);
                    checkAllFilesUploaded();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // REAL SUBMIT VERIFICATION
    document.getElementById('submitVerification').addEventListener('click', async () => {
        if (!currentUser) {
            showStatus('Please log in first.', 'error');
            return;
        }

        showStatus('Uploading documents...', 'pending');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            // Import Firestore modules
            const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            
            const db = getFirestore();

            // Prepare document data with Base64 strings
            const documentData = {};
            
            for (const [fileType, files] of Object.entries(uploadedFiles)) {
                documentData[fileType] = files.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    base64: file.base64, // Store Base64 string directly
                    uploadedAt: file.uploadedAt
                }));
            }

            // Get existing user data first (if any)
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            let userData = {};
            
            if (userSnap.exists()) {
                // Document exists, merge with existing data
                userData = userSnap.data();
            } else {
                // Document doesn't exist, create basic user data
                userData = {
                    role: 'doctor',
                    email: currentUser.email,
                    createdAt: new Date().toISOString()
                };
            }

            // Add/update verification data
            userData.verificationStatus = 'pending';
            userData.documents = documentData;
            userData.documentsSubmittedAt = new Date().toISOString();
            userData.documentsUploaded = true;

            // Use setDoc with merge to create or update the document
            await setDoc(userRef, userData, { merge: true });

            showStatus('Documents submitted successfully! Waiting for admin verification.', 'success');
            submitBtn.textContent = 'Verification Submitted';

            console.log('✅ All documents uploaded successfully to Firestore');
            console.log('User document created/updated:', userData);

        } catch (error) {
            console.error('Error uploading documents:', error);
            showStatus('Error uploading documents: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit for Verification';
        }
    });

    // Make upload areas clickable
    document.querySelectorAll('.upload-area').forEach(area => {
        area.addEventListener('click', (e) => {
            if (e.target.classList.contains('upload-area')) {
                const fileInput = area.querySelector('.file-input');
                fileInput.click();
            }
        });
    });
}

function getFileType(inputId) {
    switch(inputId) {
        case 'certificateFile': return 'certificate';
        case 'governmentIdFile': return 'governmentId';
        case 'medicalIdFile': return 'medicalId';
        default: return 'document';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function renderUploadedFiles(fileType) {
    const containerId = fileType + 'Files';
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    uploadedFiles[fileType].forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <i class="fas fa-file file-icon"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${file.size}</div>
            </div>
            <i class="fas fa-times file-remove" data-type="${fileType}" data-id="${file.id}"></i>
        `;
        container.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const fileType = e.target.getAttribute('data-type');
            const fileId = parseInt(e.target.getAttribute('data-id'));
            const index = uploadedFiles[fileType].findIndex(file => file.id === fileId);
            if (index !== -1) {
                uploadedFiles[fileType].splice(index, 1);
                renderUploadedFiles(fileType);
                checkAllFilesUploaded();
            }
        });
    });
}

function checkAllFilesUploaded() {
    const submitBtn = document.getElementById('submitVerification');
    const allUploaded = 
        uploadedFiles.certificate.length > 0 &&
        uploadedFiles.governmentId.length > 0 &&
        uploadedFiles.medicalId.length > 0;
        
    submitBtn.disabled = !allUploaded;
}

function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
}