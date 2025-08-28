// Professional Theme Switcher
export function initTheme() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'btn-icon';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    
    // Insert into header
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.insertBefore(themeToggle, headerActions.firstChild);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        enableDarkMode();
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', toggleTheme);
    
    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            e.matches ? enableDarkMode() : enableLightMode();
        }
    });
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    const html = document.documentElement;
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
    }
}

function enableLightMode() {
    const html = document.documentElement;
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// Initialize theme
document.addEventListener('DOMContentLoaded', initTheme);
        if (!file) return;
        
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('Please log in to upload answers');
                return;
            }
            
            const storageRef = ref(storage, `answers/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        }
    ;
