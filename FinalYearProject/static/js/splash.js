// ============================================
// SPLASH PAGE SCRIPT - MJart
// Auto-redirect to home page after 4 seconds
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const splashContainer = document.querySelector('.splash-container');
    
    // After 4 seconds, fade out and redirect
    setTimeout(function() {
        // Add fade-out class for smooth transition
        splashContainer.classList.add('fade-out');
        
        // Redirect after fade animation completes (0.8s)
        setTimeout(function() {
            window.location.href = '/home';
        }, 800);
    }, 4000); // 4 seconds delay
});