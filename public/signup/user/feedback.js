document.getElementById('feedbackForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            document.getElementById('feedbackForm').style.display = 'none';
            document.getElementById('thankYou').style.display = 'block';
            console.log('Feedback submitted:', {
                name: name,
                email: email,
                message: message
            });
        });
