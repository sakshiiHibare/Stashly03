document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Simulate login validation
            if (email && password) {
                // Redirect to dashboard
                window.location.href = 'index.html';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Simulate signup process
            if (username && email && password) {
                // Redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    // Dashboard functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.btn-share');
    if (shareButtons) {
        shareButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const platform = this.dataset.platform;
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('Check out this space on Airattix!');
                
                let shareUrl = '';
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${text}%20${url}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // Chatbot booking assistant functionality (storage + parking pages)
    const chatbotWidgets = document.querySelectorAll('.chatbot-widget');
    if (chatbotWidgets.length) {
        chatbotWidgets.forEach(widget => {
            const toggleBtn = widget.querySelector('.chatbot-toggle');
            const body = widget.querySelector('.chatbot-body');
            const input = widget.querySelector('.chatbot-input');
            const sendBtn = widget.querySelector('.chatbot-send');
            const optionButtons = widget.querySelectorAll('.chat-option-btn');
            const bookingUrl = widget.dataset.bookingUrl || '#';
            const availableItems = Array.from(optionButtons).map(btn => btn.dataset.item.toLowerCase());

            const addMessage = (message, type = 'bot') => {
                if (!body) return;
                const msg = document.createElement('div');
                msg.className = `chat-message ${type}`;
                msg.textContent = message;
                body.appendChild(msg);
                body.scrollTop = body.scrollHeight;
            };

            const redirectToBooking = (selectedItem) => {
                addMessage(`Great choice! Redirecting you to booking for "${selectedItem}"...`, 'bot');
                const redirectUrl = `${bookingUrl}?item=${encodeURIComponent(selectedItem)}`;
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 900);
            };

            const processSelection = (selectedItem) => {
                if (!selectedItem) return;

                addMessage(selectedItem, 'user');
                const normalized = selectedItem.trim().toLowerCase();

                if (availableItems.includes(normalized)) {
                    redirectToBooking(selectedItem.trim());
                } else {
                    addMessage('Sorry, I could not find that item in the current list. Please choose one of the options shown.', 'bot');
                }
            };

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    widget.classList.toggle('open');
                });
            }

            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    processSelection(button.dataset.item || button.textContent);
                });
            });

            if (sendBtn && input) {
                sendBtn.addEventListener('click', () => {
                    processSelection(input.value);
                    input.value = '';
                });

                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        processSelection(input.value);
                        input.value = '';
                    }
                });
            }
        });
    }

    // Initialize map if available
    const mapElement = document.getElementById('map');
    if (mapElement && typeof google !== 'undefined') {
        const map = new google.maps.Map(mapElement, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 5
        });
    }
});