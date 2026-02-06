/* ============================================
   MAIN SCRIPT - MJart
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // HAMBURGER MENU TOGGLE
    // ============================================
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (hamburgerBtn && dropdownMenu) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header-right') && !event.target.closest('.dropdown-menu')) {
                hamburgerBtn.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }
        });

        // Close menu when a link is clicked
        const menuLinks = dropdownMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerBtn.classList.remove('active');
                dropdownMenu.classList.remove('active');
            });
        });
    }

    // ============================================
    // NOTIFICATION BELL CLICK
    // ============================================
    const notificationsBtn = document.querySelector('.notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            alert('You have 3 new notifications!\n\n1. Your image edit is ready\n2. New template available\n3. Storage limit reminder');
        });
    }

    // ============================================
    // PROFILE BUTTON CLICK
    // ============================================
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            alert('Profile page will open here!\n\nUsername: User123\nEmail: user@example.com');
        });
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log('[v0] Searching for:', searchTerm);
            // Add your search logic here
        }
    }

    // ============================================
    // FEATURE BUTTON NAVIGATION
    // ============================================
    const featureButtons = document.querySelectorAll('.feature-btn');
    featureButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            console.log('[v0] Navigating to:', href);
        });
    });

    // ============================================
    // SECTION CONTENT LOGIC (For other pages)
    // ============================================
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        setupSectionLogic();
    }
});

// ============================================
// SHOW SECTION FUNCTION
// ============================================
function showSection(sectionName) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    console.log('[v0] Showing section:', sectionName);

    // Assume user has NOT created any work
    const userHasWork = false;

    // RECENT WORKS OR WISHLIST
    if (sectionName === "Recent Works" || sectionName === "Wishlist") {
        if (!userHasWork) {
            contentArea.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h1 class="empty-title">Start Editing</h1>
                    <p class="empty-text">Your ${sectionName.toLowerCase()} will appear here once you begin.</p>
                    <button onclick="goBackToTools()" class="btn-small">Back to Tools</button>
                </div>
            `;
        } else {
            contentArea.innerHTML = `
                <h2>${sectionName}</h2>
                <p>Your saved projects will be shown here.</p>
            `;
        }
    }

    // LOGIN
    if (sectionName === "Login") {
        contentArea.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Login</h2>
                <form style="max-width: 400px; margin: 0 auto;">
                    <input type="email" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;" /><br>
                    <input type="password" placeholder="Password" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;" /><br>
                    <button type="submit" class="btn-small" style="width: 100%;">Login</button>
                </form>
            </div>
        `;
    }

    // SIGN UP
    if (sectionName === "Signup") {
        contentArea.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Create Account</h2>
                <form style="max-width: 400px; margin: 0 auto;">
                    <input type="text" placeholder="Username" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;" /><br>
                    <input type="email" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;" /><br>
                    <input type="password" placeholder="Password" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;" /><br>
                    <button type="submit" class="btn-small" style="width: 100%;">Sign Up</button>
                </form>
            </div>
        `;
    }

    // Close sidebar after click
    toggleMenu();
}

// ============================================
// TOGGLE MENU FUNCTION
// ============================================
function toggleMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (hamburgerBtn && dropdownMenu) {
        hamburgerBtn.classList.remove('active');
        dropdownMenu.classList.remove('active');
    }
}

// ============================================
// BACK TO TOOLS FUNCTION
// ============================================
function goBackToTools() {
    window.location.href = '/home';
}

// ============================================
// GO TO EDITOR FUNCTION
// ============================================
function goToEditor() {
    window.location.href = '/editor';
}

// ============================================
// SETUP SECTION LOGIC
// ============================================
function setupSectionLogic() {
    console.log('[v0] Section logic initialized');
}
