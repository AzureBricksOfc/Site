// scripts.js - Basic interactivity and authentication for Azure Bricks portal

document.addEventListener('DOMContentLoaded', () => {
    console.log("Azure Bricks Portal Loaded!");
    loadTheme();
    checkAuth();
});

// ==========================================
// THEME SYSTEM
// ==========================================

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('azureBricksTheme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function loadTheme() {
    if (localStorage.getItem('azureBricksTheme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    }
}

// ==========================================
// AUTHENTICATION SYSTEM (Using LocalStorage)
// ==========================================

function getDb() {
    let db = localStorage.getItem('azureBricksDb');
    if (db) {
        db = JSON.parse(db);
        if(!db.forumTopics) db.forumTopics = []; // Migration for older DBs
        return db;
    }
    // Initialize DB if empty
    const newDb = { users: {}, currentUser: null, forumTopics: [] };
    localStorage.setItem('azureBricksDb', JSON.stringify(newDb));
    return newDb;
}

function saveDb(db) {
    localStorage.setItem('azureBricksDb', JSON.stringify(db));
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if(!loginForm || !signupForm) return;

    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
    document.getElementById('signup-success').style.display = 'none';

    if (mode === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    
    const db = getDb();
    const errorEl = document.getElementById('signup-error');
    const successEl = document.getElementById('signup-success');
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (db.users[username]) {
        errorEl.textContent = 'Username already exists.';
        errorEl.style.display = 'block';
        return;
    }

    db.users[username] = { 
        password: password,
        joinDate: new Date().toLocaleDateString(),
        avatar: 'assets/Site/Logo2.png',
        bio: "This user hasn't written a bio yet."
    };
    saveDb(db);
    successEl.style.display = 'block';
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    setTimeout(() => toggleAuthMode('login'), 1500);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    const db = getDb();
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    if (db.users[username] && db.users[username].password === password) {
        db.currentUser = username;
        saveDb(db);
        window.location.href = 'index.html';
    } else {
        errorEl.textContent = 'Invalid username or password.';
        errorEl.style.display = 'block';
    }
}

function handleLogout() {
    const db = getDb();
    db.currentUser = null;
    saveDb(db);
    window.location.href = 'index.html';
}

function checkAuth() {
    const db = getDb();
    const userInfoDiv = document.getElementById('user-info');
    
    const isDark = document.body.classList.contains('dark-theme');
    const themeIconStr = isDark ? '☀️' : '🌙';
    const themeBtnHtml = `<span id="theme-icon" class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme">${themeIconStr}</span>`;

    if (db.currentUser) {
        let userProfile = db.users[db.currentUser] || {};
        let avatarUrl = userProfile.avatar || 'assets/Site/Logo2.png';
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                ${themeBtnHtml}
                <a href="profile.html?user=${encodeURIComponent(db.currentUser)}" style="text-decoration:none; color:inherit; display:inline-flex; align-items:center;">
                    <img id="nav-avatar" src="${avatarUrl}" alt="Avatar" style="width:24px; height:24px; border-radius:50%; margin-right:6px; object-fit:cover; border:1px solid rgba(255,255,255,0.6);">
                    <span style="font-weight:500;">${db.currentUser}</span>
                </a>
                <button onclick="handleLogout()" style="background:none; border:1px solid rgba(255,255,255,0.5); color:white; padding:4px 8px; border-radius:3px; cursor:pointer; margin-left:10px;">Logout</button>
            `;
        }
        const profileName = document.querySelector('.profile-section h2');
        if (profileName) profileName.textContent = `Hello, ${db.currentUser}!`;
        
        const profileAvatar = document.querySelector('.profile-section img');
        if (profileAvatar) profileAvatar.src = avatarUrl;
        
        const profileStatus = document.querySelector('.profile-section .status');
        if (profileStatus) profileStatus.textContent = userProfile.bio || "No bio yet.";
        
        const profileBtn = document.querySelector('.profile-section .btn-primary');
        if (profileBtn) {
            profileBtn.textContent = "View Profile";
            profileBtn.onclick = () => window.location.href = `profile.html?user=${encodeURIComponent(db.currentUser)}`;
        }
    } else {
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                ${themeBtnHtml}
                <a href="login.html">Login</a>
                <a href="login.html?mode=signup">Sign Up</a>
            `;
        }
        const profileName = document.querySelector('.profile-section h2');
        if (profileName) profileName.textContent = `Hello, Guest!`;
        
        const profileBtn = document.querySelector('.profile-section .btn-primary');
        if (profileBtn) {
            profileBtn.textContent = "Login to View";
            profileBtn.onclick = () => window.location.href = 'login.html';
        }
    }
}

// ==========================================
// GAME LAUNCHER (Simulated)
// ==========================================
function launchGame(gameName) {
    const db = getDb();
    if (!db.currentUser) {
        alert("You must be logged in to play games!");
        window.location.href = "login.html";
        return;
    }
    // ... [Overlay simulation logic omitted for brevity in this snippet, using basic alert for now]
    alert(`Launching ${gameName} for ${db.currentUser}... (Simulated)`);
}

// ==========================================
// FORUM SYSTEM
// ==========================================

function renderForumHome() {
    const container = document.getElementById('forum-container');
    if (!container) return;
    const db = getDb();

    let html = `
        <div class="forum-header">
            <h3>General Discussion</h3>
            ${db.currentUser ? `<button class="action-btn" onclick="showCreateTopic()">Create Topic</button>` : `<span style="font-size:12px;">Login to post</span>`}
        </div>
        <div class="forum-list">
    `;

    if (db.forumTopics.length === 0) {
        html += `<div class="forum-row"><p style="color:var(--text-muted); text-align:center; width:100%;">No topics yet. Be the first to post!</p></div>`;
    } else {
        // Reverse array to show newest first
        [...db.forumTopics].reverse().forEach((topic, revIndex) => {
            const actualIndex = db.forumTopics.length - 1 - revIndex;
            html += `
            <div class="forum-row">
                <div>
                    <a onclick="viewTopic(${actualIndex})" class="forum-title">${escapeHtml(topic.title)}</a>
                    <div class="forum-author">By ${topic.author} - ${new Date(topic.date).toLocaleDateString()}</div>
                </div>
                <div class="forum-replies">${topic.replies.length} Replies</div>
            </div>`;
        });
    }

    html += `</div>`;
    container.innerHTML = html;
}

function showCreateTopic() {
    const container = document.getElementById('forum-container');
    container.innerHTML = `
        <button class="action-btn" style="margin-bottom: 15px; background: #666;" onclick="renderForumHome()">← Back to Forum</button>
        <div class="form-area">
            <h3>Create New Topic</h3>
            <input type="text" id="new-topic-title" placeholder="Topic Title" maxlength="100">
            <textarea id="new-topic-content" placeholder="Write your post here..." rows="6"></textarea>
            <button class="action-btn" onclick="submitTopic()">Post Topic</button>
        </div>
    `;
}

function submitTopic() {
    const title = document.getElementById('new-topic-title').value.trim();
    const content = document.getElementById('new-topic-content').value.trim();
    const db = getDb();

    if (!db.currentUser) return alert("Must be logged in.");
    if (!title || !content) return alert("Please fill in all fields.");

    db.forumTopics.push({
        title: title,
        content: content,
        author: db.currentUser,
        date: new Date().toISOString(),
        replies: []
    });

    saveDb(db);
    renderForumHome();
}

function viewTopic(index) {
    const db = getDb();
    const topic = db.forumTopics[index];
    if(!topic) return;
    const container = document.getElementById('forum-container');

    let html = `
        <button class="action-btn" style="margin-bottom: 15px; background: #666;" onclick="renderForumHome()">← Back to Forum</button>
        <h2 style="margin-bottom: 10px;">${escapeHtml(topic.title)}</h2>
        
        <!-- Original Post -->
        <div class="post-card">
            <div class="post-user">
                <div class="post-user-avatar"></div>
                <strong>${topic.author}</strong>
            </div>
            <div class="post-content">
                <div class="post-date">Posted on ${new Date(topic.date).toLocaleString()}</div>
                ${escapeHtml(topic.content)}
            </div>
        </div>
    `;

    // Replies
    topic.replies.forEach(reply => {
        html += `
        <div class="post-card">
            <div class="post-user">
                <div class="post-user-avatar"></div>
                <strong>${reply.author}</strong>
            </div>
            <div class="post-content">
                <div class="post-date">Reply on ${new Date(reply.date).toLocaleString()}</div>
                ${escapeHtml(reply.content)}
            </div>
        </div>`;
    });

    // Reply Form
    if (db.currentUser) {
        html += `
            <div class="form-area">
                <h4>Leave a Reply</h4>
                <textarea id="reply-content" placeholder="Type your reply..." rows="4"></textarea>
                <button class="action-btn" onclick="submitReply(${index})">Post Reply</button>
            </div>
        `;
    } else {
        html += `<p style="margin-top:20px; text-align:center;">You must be <a href="login.html">logged in</a> to reply.</p>`;
    }

    container.innerHTML = html;
}

function submitReply(topicIndex) {
    const content = document.getElementById('reply-content').value.trim();
    const db = getDb();

    if (!db.currentUser) return alert("Must be logged in.");
    if (!content) return alert("Reply cannot be empty.");

    db.forumTopics[topicIndex].replies.push({
        content: content,
        author: db.currentUser,
        date: new Date().toISOString()
    });

    saveDb(db);
    viewTopic(topicIndex);
}

// Utility to prevent XSS in simple forum
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// ==========================================
// PROFILE SYSTEM
// ==========================================

function loadProfilePage() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user');
    if (!username) {
        document.querySelector('.profile-page-container').innerHTML = '<h2>User not found.</h2>';
        return;
    }

    const db = getDb();
    const userProfile = db.users[username];
    if (!userProfile) {
        document.querySelector('.profile-page-container').innerHTML = '<h2>User not found.</h2>';
        return;
    }

    document.getElementById('profile-username').textContent = username;
    document.getElementById('profile-joindate').textContent = userProfile.joinDate || 'Unknown';
    document.getElementById('profile-bio').textContent = userProfile.bio || "This user hasn't written a bio yet.";
    document.getElementById('profile-avatar').src = userProfile.avatar || 'assets/Site/Logo2.png';

    if (db.currentUser === username) {
        document.getElementById('edit-mode-btn').style.display = 'block';
    }
}

function toggleEditMode(show) {
    document.getElementById('edit-profile-section').style.display = show ? 'block' : 'none';
    document.getElementById('profile-bio-container').style.display = show ? 'none' : 'block';
    document.getElementById('edit-mode-btn').style.display = show ? 'none' : 'block';
    
    if (show) {
        const db = getDb();
        const userProfile = db.users[db.currentUser];
        document.getElementById('edit-avatar').value = userProfile.avatar || '';
        document.getElementById('edit-bio').value = userProfile.bio || '';
    }
}

function saveProfileChanges() {
    const db = getDb();
    const userProfile = db.users[db.currentUser];
    if (!userProfile) return;

    const newAvatar = document.getElementById('edit-avatar').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();

    userProfile.avatar = newAvatar || 'assets/Site/Logo2.png';
    userProfile.bio = newBio || "This user hasn't written a bio yet.";
    
    saveDb(db);
    
    document.getElementById('profile-avatar').src = userProfile.avatar;
    document.getElementById('profile-bio').textContent = userProfile.bio;
    
    toggleEditMode(false);
    checkAuth();
}
