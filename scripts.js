// scripts.js - Azure Bricks Portal (Firebase + Async)

const firebaseConfig = {
  apiKey: "AIzaSyBBjAcSb0XBQjqbpqzeaiG8QtO7oft_su0",
  authDomain: "azurebricks-447b0.firebaseapp.com",
  projectId: "azurebricks-447b0",
  storageBucket: "azurebricks-447b0.firebasestorage.app",
  messagingSenderId: "858764169894",
  appId: "1:858764169894:web:e72d6366e37fb998355a67",
  measurementId: "G-VJ6C4J1WWJ"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

// Keep a local reference to the logged-in user
let currentUser = localStorage.getItem('ab_currentUser');

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Azure Bricks Portal Loaded!");
    loadTheme();
    await checkAuth();
    if(window.location.pathname.includes('forum.html')) renderForumHome();
    if(window.location.pathname.includes('profile.html')) loadProfilePage();
    if(window.location.pathname.includes('users.html')) loadUsersPage();
});

// THEME SYSTEM
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

// AUTHENTICATION
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

async function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    
    const errorEl = document.getElementById('signup-error');
    const successEl = document.getElementById('signup-success');
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    const userDoc = await firestore.collection('users').doc(username).get();
    if (userDoc.exists) {
        errorEl.textContent = 'Username already exists.';
        errorEl.style.display = 'block';
        return;
    }

    await firestore.collection('users').doc(username).set({
        password: password,
        joinDate: new Date().toLocaleDateString(),
        avatar: 'assets/Site/Logo2.png',
        bio: "This user hasn't written a bio yet.",
        friends: []
    });
    
    successEl.style.display = 'block';
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    setTimeout(() => toggleAuthMode('login'), 1500);
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    const userDoc = await firestore.collection('users').doc(username).get();
    if (userDoc.exists && userDoc.data().password === password) {
        localStorage.setItem('ab_currentUser', username);
        window.location.href = 'index.html';
    } else {
        errorEl.textContent = 'Invalid username or password.';
        errorEl.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('ab_currentUser');
    window.location.href = 'index.html';
}

async function checkAuth() {
    currentUser = localStorage.getItem('ab_currentUser');
    const userInfoDiv = document.getElementById('user-info');
    const isDark = document.body.classList.contains('dark-theme');
    const themeIconStr = isDark ? '☀️' : '🌙';
    const themeBtnHtml = `<span id="theme-icon" class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme">${themeIconStr}</span>`;

    if (currentUser) {
        const userDoc = await firestore.collection('users').doc(currentUser).get();
        const userProfile = userDoc.data() || {};
        let avatarUrl = userProfile.avatar || 'assets/Site/Logo2.png';
        
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                ${themeBtnHtml}
                <a href="users.html">Players</a>
                <a href="profile.html?user=${encodeURIComponent(currentUser)}" style="text-decoration:none; color:inherit; display:inline-flex; align-items:center;">
                    <img id="nav-avatar" src="${avatarUrl}" alt="Avatar" style="width:24px; height:24px; border-radius:50%; margin-right:6px; object-fit:cover; border:1px solid rgba(255,255,255,0.6);">
                    <span style="font-weight:500;">${currentUser}</span>
                </a>
                <button onclick="handleLogout()" style="background:none; border:1px solid rgba(255,255,255,0.5); color:white; padding:4px 8px; border-radius:3px; cursor:pointer; margin-left:10px;">Logout</button>
            `;
        }
        const profileName = document.querySelector('.profile-section h2');
        if (profileName) profileName.textContent = `Hello, ${currentUser}!`;
        
        const profileAvatar = document.querySelector('.profile-section img');
        if (profileAvatar) profileAvatar.src = avatarUrl;
        
        const profileStatus = document.querySelector('.profile-section .status');
        if (profileStatus) profileStatus.textContent = userProfile.bio || "No bio yet.";
        
        const profileBtn = document.querySelector('.profile-section .btn-primary');
        if (profileBtn) {
            profileBtn.textContent = "View Profile";
            profileBtn.onclick = () => window.location.href = `profile.html?user=${encodeURIComponent(currentUser)}`;
        }
    } else {
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                ${themeBtnHtml}
                <a href="users.html">Players</a>
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

// GAME LAUNCHER
function launchGame(gameName) {
    if (!currentUser) {
        alert("You must be logged in to play games!");
        window.location.href = "login.html";
        return;
    }
    alert(`Launching ${gameName} for ${currentUser}... (Simulated)`);
}

// FORUM SYSTEM
async function renderForumHome() {
    const container = document.getElementById('forum-container');
    if (!container) return;

    let html = `
        <div class="forum-header">
            <h3>General Discussion</h3>
            ${currentUser ? `<button class="action-btn" onclick="showCreateTopic()">Create Topic</button>` : `<span style="font-size:12px;">Login to post</span>`}
        </div>
        <div class="forum-list">
    `;

    const snapshot = await firestore.collection('forum').orderBy('date', 'desc').get();
    if (snapshot.empty) {
        html += `<div class="forum-row"><p style="color:var(--text-muted); text-align:center; width:100%;">No topics yet. Be the first to post!</p></div>`;
    } else {
        snapshot.forEach(doc => {
            const topic = doc.data();
            html += `
            <div class="forum-row">
                <div>
                    <a onclick="viewTopic('${doc.id}')" class="forum-title" style="cursor:pointer; color:var(--primary-color);">${escapeHtml(topic.title)}</a>
                    <div class="forum-author">By ${topic.author} - ${new Date(topic.date).toLocaleDateString()}</div>
                </div>
                <div class="forum-replies">${topic.replies ? topic.replies.length : 0} Replies</div>
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

async function submitTopic() {
    const title = document.getElementById('new-topic-title').value.trim();
    const content = document.getElementById('new-topic-content').value.trim();

    if (!currentUser) return alert("Must be logged in.");
    if (!title || !content) return alert("Please fill in all fields.");

    await firestore.collection('forum').add({
        title: title,
        content: content,
        author: currentUser,
        date: new Date().toISOString(),
        replies: []
    });

    renderForumHome();
}

async function viewTopic(topicId) {
    const docRef = firestore.collection('forum').doc(topicId);
    const docSnap = await docRef.get();
    if(!docSnap.exists) return;
    const topic = docSnap.data();
    const container = document.getElementById('forum-container');

    let html = `
        <button class="action-btn" style="margin-bottom: 15px; background: #666;" onclick="renderForumHome()">← Back to Forum</button>
        <h2 style="margin-bottom: 10px;">${escapeHtml(topic.title)}</h2>
        
        <div class="post-card">
            <div class="post-user">
                <strong>${topic.author}</strong>
            </div>
            <div class="post-content">
                <div class="post-date">Posted on ${new Date(topic.date).toLocaleString()}</div>
                ${escapeHtml(topic.content)}
            </div>
        </div>
    `;

    if(topic.replies) {
        topic.replies.forEach(reply => {
            html += `
            <div class="post-card">
                <div class="post-user">
                    <strong>${reply.author}</strong>
                </div>
                <div class="post-content">
                    <div class="post-date">Reply on ${new Date(reply.date).toLocaleString()}</div>
                    ${escapeHtml(reply.content)}
                </div>
            </div>`;
        });
    }

    if (currentUser) {
        html += `
            <div class="form-area">
                <h4>Leave a Reply</h4>
                <textarea id="reply-content" placeholder="Type your reply..." rows="4"></textarea>
                <button class="action-btn" onclick="submitReply('${topicId}')">Post Reply</button>
            </div>
        `;
    } else {
        html += `<p style="margin-top:20px; text-align:center;">You must be <a href="login.html">logged in</a> to reply.</p>`;
    }

    container.innerHTML = html;
}

async function submitReply(topicId) {
    const content = document.getElementById('reply-content').value.trim();
    if (!currentUser) return alert("Must be logged in.");
    if (!content) return alert("Reply cannot be empty.");

    const docRef = firestore.collection('forum').doc(topicId);
    const docSnap = await docRef.get();
    const topic = docSnap.data();
    const replies = topic.replies || [];
    replies.push({
        content: content,
        author: currentUser,
        date: new Date().toISOString()
    });

    await docRef.update({ replies: replies });
    viewTopic(topicId);
}

function escapeHtml(unsafe) {
    return (unsafe||"")
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// PROFILE SYSTEM
async function loadProfilePage() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user');
    const container = document.querySelector('.profile-page-container');
    if (!username || !container) {
        if(container) container.innerHTML = '<h2>User not found.</h2>';
        return;
    }

    const userDoc = await firestore.collection('users').doc(username).get();
    if (!userDoc.exists) {
        container.innerHTML = '<h2>User not found.</h2>';
        return;
    }
    const userProfile = userDoc.data();

    document.getElementById('profile-username').textContent = username;
    document.getElementById('profile-joindate').textContent = userProfile.joinDate || 'Unknown';
    document.getElementById('profile-bio').textContent = userProfile.bio || "This user hasn't written a bio yet.";
    document.getElementById('profile-avatar').src = userProfile.avatar || 'assets/Site/Logo2.png';

    if (currentUser === username) {
        document.getElementById('edit-mode-btn').style.display = 'block';
        if(document.getElementById('add-friend-btn')) document.getElementById('add-friend-btn').style.display = 'none';
    } else {
        document.getElementById('edit-mode-btn').style.display = 'none';
        if(currentUser && document.getElementById('add-friend-btn')) document.getElementById('add-friend-btn').style.display = 'block';
    }

    // Load friends
    const friendsList = document.getElementById('friends-list');
    if(friendsList) {
        if(!userProfile.friends || userProfile.friends.length === 0) {
            friendsList.innerHTML = '<p style="margin:0; font-size:0.9em; color:var(--text-muted);">No friends yet.</p>';
        } else {
            friendsList.innerHTML = userProfile.friends.map(f => `<a href="profile.html?user=${f}" style="display:inline-block; margin-right:10px; padding: 5px 10px; background:var(--primary-color); color:white; border-radius: 20px; text-decoration:none; font-weight:bold; font-size:0.9em;">${f}</a>`).join('');
        }
    }
}

function toggleEditMode(show) {
    document.getElementById('edit-profile-section').style.display = show ? 'block' : 'none';
    document.getElementById('profile-bio-container').style.display = show ? 'none' : 'block';
    document.getElementById('edit-mode-btn').style.display = show ? 'none' : 'block';
    
    if (show && currentUser) {
        firestore.collection('users').doc(currentUser).get().then(doc => {
            const userProfile = doc.data();
            document.getElementById('edit-avatar').value = userProfile.avatar || '';
            document.getElementById('edit-bio').value = userProfile.bio || '';
        });
    }
}

async function saveProfileChanges() {
    if(!currentUser) return;
    const newAvatar = document.getElementById('edit-avatar').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();

    await firestore.collection('users').doc(currentUser).update({
        avatar: newAvatar || 'assets/Site/Logo2.png',
        bio: newBio || "This user hasn't written a bio yet."
    });
    
    loadProfilePage();
    toggleEditMode(false);
    checkAuth();
}

async function addFriend() {
    if(!currentUser) return alert("Must be logged in to add friends!");
    const params = new URLSearchParams(window.location.search);
    const targetUser = params.get('user');
    if(!targetUser || targetUser === currentUser) return;

    const myDocRef = firestore.collection('users').doc(currentUser);
    const myDoc = await myDocRef.get();
    let myFriends = myDoc.data().friends || [];
    
    if(!myFriends.includes(targetUser)) {
        myFriends.push(targetUser);
        await myDocRef.update({ friends: myFriends });
        alert(`You added ${targetUser} as a friend!`);
        
        // Add reciprocal
        const targetDocRef = firestore.collection('users').doc(targetUser);
        const targetDoc = await targetDocRef.get();
        if (targetDoc.exists) {
            let targetFriends = targetDoc.data().friends || [];
            if(!targetFriends.includes(currentUser)) {
                targetFriends.push(currentUser);
                await targetDocRef.update({ friends: targetFriends });
            }
        }
        loadProfilePage();
    } else {
        alert("You are already friends!");
    }
}

// USERS LIST SYSTEM
async function loadUsersPage() {
    const container = document.getElementById('users-container');
    if(!container) return;
    
    container.innerHTML = '<p>Loading players...</p>';
    const snapshot = await firestore.collection('users').get();
    let html = '';
    snapshot.forEach(doc => {
        const u = doc.data();
        html += `
        <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:15px; cursor:pointer;" onclick="window.location.href='profile.html?user=${doc.id}'">
            <img src="${u.avatar || 'assets/Site/Logo2.png'}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-color);">
            <div>
                <h3 style="margin:0;"><a href="profile.html?user=${doc.id}" style="color:var(--text-color); text-decoration:none;">${doc.id}</a></h3>
                <p style="color:var(--text-muted); font-size:14px; margin-top:5px; margin-bottom:0;">Joined: ${u.joinDate || 'Unknown'}</p>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}
