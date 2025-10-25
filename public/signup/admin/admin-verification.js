import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
const db = getFirestore(app);

class AdminVerification {
    constructor() {
        this.pendingList = document.getElementById('pendingList');
        this.verifiedList = document.getElementById('verifiedList');
        this.pendingCount = document.getElementById('pendingCount');
        this.init();
    }

    init() {
        this.loadNutritionists();
        this.setupRealTimeListener();
    }

    setupRealTimeListener() {
        const usersRef = collection(db, 'users');
        onSnapshot(usersRef, (snapshot) => {
            this.loadNutritionists();
        });
    }

    async loadNutritionists() {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            
            const pending = [];
            const verified = [];

            snapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.role === 'doctor') {
                    const nutritionist = { 
                        userId: doc.id, 
                        ...userData 
                    };
                    
                    if (userData.verificationStatus === 'pending' && userData.documentsUploaded) {
                        pending.push(nutritionist);
                    } else if (userData.verificationStatus === 'verified') {
                        verified.push(nutritionist);
                    }
                }
            });

            this.renderPendingList(pending);
            this.renderVerifiedList(verified);
            this.updatePendingCount(pending.length);
            
        } catch (error) {
            console.error('Error loading nutritionists:', error);
            this.pendingList.innerHTML = '<div class="empty-state">Error loading data</div>';
        }
    }

    renderPendingList(pendingNutritionists) {
        if (pendingNutritionists.length === 0) {
            this.pendingList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Pending Verifications</h3>
                    <p>All nutritionist applications have been processed.</p>
                </div>
            `;
            return;
        }

        this.pendingList.innerHTML = pendingNutritionists.map(nutritionist => `
            <div class="nutritionist-card">
                <div class="nutritionist-header">
                    <div class="nutritionist-info">
                        <h3>${nutritionist.name || 'Unknown Name'}</h3>
                        <p><strong>Email:</strong> ${nutritionist.email || 'No email'}</p>
                        <p><strong>Medical ID:</strong> ${nutritionist.medid || 'Not provided'}</p>
                        <p><strong>Submitted:</strong> ${new Date(nutritionist.documentsSubmittedAt).toLocaleDateString()}</p>
                    </div>
                    <div class="status-badge status-pending">Pending Review</div>
                </div>

                <div class="documents-section">
                    <h4>Submitted Documents:</h4>
                    ${this.renderDocuments(nutritionist.documents)}
                </div>

                <div class="action-buttons">
                    <button class="btn btn-approve" onclick="adminApprove('${nutritionist.userId}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject" onclick="adminReject('${nutritionist.userId}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderVerifiedList(verifiedNutritionists) {
        if (verifiedNutritionists.length === 0) {
            this.verifiedList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-md"></i>
                    <h3>No Verified Nutritionists</h3>
                    <p>No nutritionists have been verified yet.</p>
                </div>
            `;
            return;
        }

        this.verifiedList.innerHTML = verifiedNutritionists.map(nutritionist => `
            <div class="nutritionist-card">
                <div class="nutritionist-header">
                    <div class="nutritionist-info">
                        <h3>${nutritionist.name || 'Unknown Name'}</h3>
                        <p><strong>Email:</strong> ${nutritionist.email || 'No email'}</p>
                        <p><strong>Medical ID:</strong> ${nutritionist.medid || 'Not provided'}</p>
                        <p><strong>Verified On:</strong> ${nutritionist.verifiedAt ? new Date(nutritionist.verifiedAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div class="status-badge status-verified">Verified</div>
                </div>
                ${this.renderViewButtons(nutritionist.documents)}
            </div>
        `).join('');
    }

    renderDocuments(documents) {
        if (!documents) return '<p>No documents submitted</p>';
        
        let html = '';
        Object.entries(documents).forEach(([docType, docArray]) => {
            docArray.forEach(doc => {
                html += `
                    <div class="document-item">
                        <h4><i class="fas fa-file"></i> ${this.formatDocType(docType)}</h4>
                        <p><strong>File:</strong> ${doc.name} (${doc.size})</p>
                        <button class="btn btn-view" onclick="viewDocument('${doc.base64}', '${doc.name}')">
                            <i class="fas fa-eye"></i> View Document
                        </button>
                    </div>
                `;
            });
        });
        return html;
    }

    renderViewButtons(documents) {
        if (!documents) return '';
        
        let buttons = '';
        Object.entries(documents).forEach(([docType, docArray]) => {
            docArray.forEach(doc => {
                buttons += `
                    <button class="btn btn-view" onclick="viewDocument('${doc.base64}', '${doc.name}')">
                        <i class="fas fa-eye"></i> View ${this.formatDocType(docType)}
                    </button>
                `;
            });
        });
        return buttons;
    }

    formatDocType(docType) {
        const types = {
            certificate: 'Professional Certificate',
            governmentId: 'Government ID',
            medicalId: 'Medical ID'
        };
        return types[docType] || docType;
    }

    updatePendingCount(count) {
        this.pendingCount.textContent = `${count} Pending Verification${count !== 1 ? 's' : ''}`;
    }
}

window.adminApprove = async function(userId) {
    if (confirm('Are you sure you want to approve this nutritionist?')) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                verificationStatus: 'verified',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'admin'
            });
            alert('Nutritionist approved successfully!');
        } catch (error) {
            console.error('Error approving nutritionist:', error);
            alert('Error approving nutritionist. Please try again.');
        }
    }
};

window.adminReject = async function(userId) {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                verificationStatus: 'rejected',
                rejectionReason: reason,
                rejectedAt: new Date().toISOString()
            });
            alert('Nutritionist rejected successfully!');
        } catch (error) {
            console.error('Error rejecting nutritionist:', error);
            alert('Error rejecting nutritionist. Please try again.');
        }
    }
};

window.viewDocument = function(base64Data, fileName) {
    const newWindow = window.open();
    newWindow.document.write(`
        <html>
            <head>
                <title>${fileName}</title>
                <style>
                    body { margin: 20px; text-align: center; }
                    img { max-width: 100%; max-height: 90vh; }
                </style>
            </head>
            <body>
                <h3>${fileName}</h3>
                <img src="${base64Data}" alt="${fileName}" />
                <br><br>
                <button onclick="window.print()">Print</button>
                <button onclick="window.close()">Close</button>
            </body>
        </html>
    `);
};

document.addEventListener('DOMContentLoaded', () => {
    new AdminVerification();
});