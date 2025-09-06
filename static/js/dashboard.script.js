// =====================
// Global variables
// =====================
let currentUserRole = '';
let isCreateAccountMode = false;

// =====================
// DOM elements
// =====================
const loginModal = document.getElementById('loginModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const loginButtonText = document.getElementById('loginButtonText');
const newUserText = document.getElementById('newUserText');
const createAccountBtn = document.getElementById('createAccountBtn');
const loginForm = document.getElementById('loginForm');

// =====================
// Modal Handling
// =====================
function showLoginModal(role) {
    currentUserRole = role;
    isCreateAccountMode = false;

    if (role === 'doctor') {
        modalTitle.textContent = 'Provider Login';
        modalSubtitle.textContent = 'Access your healthcare provider dashboard';
        loginButtonText.textContent = 'Login';
        newUserText.textContent = 'New Account?';
        createAccountBtn.textContent = 'Create New Account';
        newUserText.style.display = 'block';
        createAccountBtn.style.display = 'inline-block';
    } else if (role === 'admin') {
        modalTitle.textContent = 'Admin Login';
        modalSubtitle.textContent = 'Access your administrative dashboard';
        loginButtonText.textContent = 'Login';
        newUserText.style.display = 'none';
        createAccountBtn.style.display = 'none';
    }

    loginForm.reset();
    loginModal.style.display = 'block';

    document.addEventListener('click', handleModalClick);
    document.addEventListener('keydown', handleEscapeKey);
}

function closeLoginModal() {
    loginModal.style.display = 'none';
    isCreateAccountMode = false;
    document.removeEventListener('click', handleModalClick);
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleModalClick(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
}

// =====================
// Toggle Login/Create Account
// =====================
function toggleCreateAccount() {
    isCreateAccountMode = !isCreateAccountMode;

    if (isCreateAccountMode) {
        modalTitle.textContent = 'Create New Account';
        modalSubtitle.textContent = 'Set up your credentials for the portal';
        loginButtonText.textContent = 'Create Account';
        createAccountBtn.textContent = 'Back to Login';
        newUserText.style.display = 'none';
    } else {
        if (currentUserRole === 'doctor') {
            modalTitle.textContent = 'Provider Login';
            modalSubtitle.textContent = 'Access your healthcare provider dashboard';
            loginButtonText.textContent = 'Login';
            createAccountBtn.textContent = 'Create New Account';
            newUserText.style.display = 'block';
            createAccountBtn.style.display = 'inline-block';
        } else {
            modalTitle.textContent = 'Admin Login';
            modalSubtitle.textContent = 'Access your administrative dashboard';
            loginButtonText.textContent = 'Login';
            newUserText.style.display = 'none';
            createAccountBtn.style.display = 'none';
        }
    }
}

// =====================
// Form Submission
// =====================
loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // stop browser default GET

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (isCreateAccountMode) {
        if (currentUserRole === 'admin') {
            showNotification('Admin account creation is not allowed. Only one admin account exists.', 'error');
            return;
        }
        createAccount(username, email, password);
    } else {
        authenticateUser(username, email, password);
    }
});

// =====================
// Create Account
// =====================
async function createAccount(username, email, password) {
    showNotification('Creating account...', 'info');

    try {
        const response = await fetch('/create-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role: currentUserRole })
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(result.message || 'Account created successfully!', 'success');
            setTimeout(() => { toggleCreateAccount(); }, 1500);
        } else {
            showNotification(result.message || 'Account creation failed. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect to the server. Please try again later.', 'error');
        console.error('Account creation error:', error);
    }
}

// =====================
// Authenticate User
// =====================
async function authenticateUser(username, email, password) {
    showNotification('Authenticating...', 'info');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role: currentUserRole })
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(result.message || 'Login successful!', 'success');

            try {
                localStorage.setItem('cts_user', JSON.stringify({
                    username: result.username,
                    email: email,
                    role: result.role
                }));
            } catch (e) {
                console.error('LocalStorage error:', e);
            }

            setTimeout(() => {
                if (result.role === 'doctor') {
                    window.location.href = '/doctor';
                } else if (result.role === 'admin') {
                    window.location.href = '/admin';
                }
            }, 1000);
        } else {
            showNotification(result.message || 'Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect to the server. Please try again later.', 'error');
        console.error('Login error:', error);
    }
}

// =====================
// Notification CSS
// =====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// =====================
// Page Init
// =====================
document.addEventListener('DOMContentLoaded', function () {
    // smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // sticky header effect
    window.addEventListener('scroll', function () {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
});
