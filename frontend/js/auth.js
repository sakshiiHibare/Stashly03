// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
let mobileMenuOpen = false;

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        if (!mobileMenuOpen) {
            // Create mobile menu
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            mobileMenu.innerHTML = `
                <nav>
                    <ul>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#storage"><i data-feather="package"></i> Goods Storage</a></li>
                        <li><a href="#parking"><i data-feather="map-pin"></i> Car Parking</a></li>
                        <li><a href="#movers"><i data-feather="truck"></i> Movers</a></li>
                    </ul>
                </nav>
                <div class="mobile-auth">
                    <a href="#login" class="login-btn">Login</a>
                    <a href="#register" class="register-btn">Register</a>
                </div>
            `;
            
            // Add styles
            mobileMenu.style.position = 'fixed';
            mobileMenu.style.top = '60px';
            mobileMenu.style.left = '0';
            mobileMenu.style.width = '100%';
            mobileMenu.style.backgroundColor = '#1A1F2C';
            mobileMenu.style.padding = '1rem';
            mobileMenu.style.zIndex = '99';
            
            // Style the nav
            mobileMenu.querySelector('nav ul').style.display = 'flex';
            mobileMenu.querySelector('nav ul').style.flexDirection = 'column';
            mobileMenu.querySelector('nav ul').style.gap = '1rem';
            
            // Style the auth buttons
            mobileMenu.querySelector('.mobile-auth').style.display = 'flex';
            mobileMenu.querySelector('.mobile-auth').style.flexDirection = 'column';
            mobileMenu.querySelector('.mobile-auth').style.gap = '1rem';
            mobileMenu.querySelector('.mobile-auth').style.marginTop = '1rem';
            
            // Append to body
            document.body.appendChild(mobileMenu);
            
            // Replace icons
            feather.replace();
            
            mobileMenuOpen = true;
            mobileMenuBtn.innerHTML = '<i data-feather="x"></i>';
            feather.replace();
        } else {
            // Remove mobile menu
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.remove();
            }
            
            mobileMenuOpen = false;
            mobileMenuBtn.innerHTML = '<i data-feather="menu"></i>';
            feather.replace();
        }
    });
}

// Smooth scroll functionality
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (mobileMenuOpen) {
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu) {
                    mobileMenu.remove();
                }
                mobileMenuOpen = false;
                mobileMenuBtn.innerHTML = '<i data-feather="menu"></i>';
                feather.replace();
            }
        }
    });
});

// Login form handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulating login (in a real app, this would connect to a backend)
        if (email && password) {
            showToast('Login successful!', 'success');
            
            // Simulate redirect after login (after 1 second)
            setTimeout(() => {
                window.location.href = "dashboard.html"; // Replace with your dashboard page
            }, 1000);
            
            // Clear form
            loginForm.reset();
        } else {
            showToast('Please enter both email and password', 'error');
        }
    });
}

// Toast notification
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}