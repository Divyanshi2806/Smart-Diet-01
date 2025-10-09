// File upload functionality
const fileInputs = document.querySelectorAll('.file-input');
const submitBtn = document.getElementById('submitVerification');
const statusMessage = document.getElementById('statusMessage');

// Track uploaded files for each category
const uploadedFiles = {
    certificate: [],
    governmentId: [],
    medicalId: []
};

fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = getFileType(input.id);
            const fileId = Date.now();
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showStatus('File size exceeds 5MB limit. Please choose a smaller file.', 'error');
                return;
            }
            
            uploadedFiles[fileType].push({
                id: fileId,
                name: file.name,
                size: formatFileSize(file.size),
                type: fileType
            });
            
            renderUploadedFiles(fileType);
            checkAllFilesUploaded();
        }
    });
});

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
    const allUploaded = 
        uploadedFiles.certificate.length > 0 &&
        uploadedFiles.governmentId.length > 0 &&
        uploadedFiles.medicalId.length > 0;
        
    submitBtn.disabled = !allUploaded;
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    
    // Hide status after 5 seconds for success/error messages
    if (type !== 'pending') {
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 5000);
    }
}

// Submit verification
document.getElementById('submitVerification').addEventListener('click', () => {
    // Show pending status
    showStatus('Your documents have been submitted for verification. This process may take 1-2 business days.', 'pending');
    
    // Disable the submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verification Submitted';
    
    // In a real application, this would send the files to a server
    // For demo purposes, we'll simulate a verification process
    setTimeout(() => {
        // After 3 seconds, simulate successful verification
        showStatus('Congratulations! Your account has been verified. Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'nutritionist-dashboard.html';
        }, 3000);
    }, 3000);
});

// Login modal function (placeholder)
function openLoginModal() {
    alert('Login functionality would open here in a complete implementation.');
}

// Make upload areas clickable
document.querySelectorAll('.upload-area').forEach(area => {
    area.addEventListener('click', (e) => {
        if (e.target.classList.contains('upload-area')) {
            const fileInput = area.querySelector('.file-input');
            fileInput.click();
        }
    });
});