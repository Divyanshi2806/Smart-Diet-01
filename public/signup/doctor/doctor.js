let currentUser = null;
let uploadedFiles = {
    certificate: [],
    governmentId: [],
    medicalId: []
};

const EMAILJS_CONFIG = {
    PUBLIC_KEY: '7mZ_9zCVGM1N7MioU',      
    SERVICE_ID: 'service_zxy9gmf',      
    TEMPLATE_ID: 'template_4solgfp'     
};

document.addEventListener('DOMContentLoaded', function() {
    initializeEmailJS();
    initializeDocumentUpload();
});

function initializeEmailJS() {
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            console.log('✅ EmailJS initialized successfully');
        } else {
            console.error('❌ EmailJS not loaded - make sure script is included in HTML');
        }
    } catch (error) {
        console.error('❌ Error initializing EmailJS:', error);
    }
}

async function initializeDocumentUpload() {
    console.log('🚀 Initializing nutritionist document upload...');
    
    if (!window.firebaseAuth) {
        console.error('Firebase not initialized');
        showStatus('Firebase not loaded. Please refresh the page.', 'error');
        return;
    }

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
            
            if (userData.verificationStatus === 'verified') {
                window.location.href = "nutritionist-dashboard.html";
            }
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

function setupFileUploads() {
    const fileInputs = document.querySelectorAll('.file-input');
    const submitBtn = document.getElementById('submitVerification');

    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileType = getFileType(input.id);
                const fileId = Date.now();
                
                if (file.size > 1 * 1024 * 1024) {
                    showStatus('File size exceeds 1MB limit. Please choose a smaller file.', 'error');
                    return;
                }
                
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    showStatus('Please upload only JPG or PNG files (PDF not supported with Base64).', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedFiles[fileType].push({
                        id: fileId,
                        name: file.name,
                        size: formatFileSize(file.size),
                        type: file.type,
                        base64: e.target.result, 
                        uploadedAt: new Date().toISOString()
                    });
                    
                    renderUploadedFiles(fileType);
                    checkAllFilesUploaded();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    document.getElementById('submitVerification').addEventListener('click', async () => {
        if (!currentUser) {
            showStatus('Please log in first.', 'error');
            return;
        }

        showStatus('Uploading documents...', 'pending');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
            
            const db = getFirestore();
            const documentData = {};
            
            for (const [fileType, files] of Object.entries(uploadedFiles)) {
                documentData[fileType] = files.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    base64: file.base64,
                    uploadedAt: file.uploadedAt
                }));
            }

            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            let userData = {};
            
            if (userSnap.exists()) {
                userData = userSnap.data();
            } else {
                userData = {
                    role: 'doctor',
                    email: currentUser.email,
                    createdAt: new Date().toISOString()
                };
            }
            userData.verificationStatus = 'pending';
            userData.documents = documentData;
            userData.documentsSubmittedAt = new Date().toISOString();
            userData.documentsUploaded = true;

            await setDoc(userRef, userData, { merge: true });

            console.log('✅ All documents uploaded successfully to Firestore');
            console.log('User document created/updated:', userData);

            const emailSent = await sendAdminEmailNotification(userData);
            
            if (emailSent) {
                showStatus('Documents submitted successfully! Admin has been notified.', 'success');
                console.log('✅ Admin notification email sent successfully');
            } else {
                showStatus('Documents submitted successfully! (Admin notification failed)', 'success');
                console.log('⚠️ Documents uploaded but admin email failed');
            }
            
            submitBtn.textContent = 'Verification Submitted';

        } catch (error) {
            console.error('Error uploading documents:', error);
            showStatus('Error uploading documents: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit for Verification';
        }
    });

    document.querySelectorAll('.upload-area').forEach(area => {
        area.addEventListener('click', (e) => {
            if (e.target.classList.contains('upload-area')) {
                const fileInput = area.querySelector('.file-input');
                fileInput.click();
            }
        });
    });
}

async function sendAdminEmailNotification(nutritionistData) {
    try {
        console.log('📧 Preparing to send admin notification...');

        const templateParams = {
            nutritionist_name: nutritionistData.name || 'Unknown Nutritionist',
            nutritionist_email: nutritionistData.email || 'No email provided',
            submission_time: new Date().toLocaleString(),
            user_id: currentUser.uid,
            document_count: countDocuments(nutritionistData.documents),
            admin_link: window.location.origin + '/Smart-Diet-01/public/signup/admin/admin.html',
            current_year: new Date().getFullYear(),
            reply_to: nutritionistData.email || 'divyanshi2535@gmail.com'
        };

        console.log('📧 Sending email with parameters:', templateParams);

        const result = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        console.log('✅ Admin notification email sent successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to send admin email:', error);
        console.log('🔧 Error status:', error.status);
        console.log('🔧 Error text:', error.text);
        return false;
    }
}
function countDocuments(documents) {
    if (!documents) return 0;
    return Object.values(documents).reduce((total, files) => total + files.length, 0);
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
