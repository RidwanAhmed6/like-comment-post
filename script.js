// Firebase কনফিগারেশন
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase ইনিশিয়ালাইজ করা
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// পোস্ট সাবমিশন হ্যান্ডল করা
document.getElementById('postForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // ফর্ম থেকে ডেটা নেওয়া
    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;

    // ডাটাবেসে পোস্ট সংরক্ষণ করা
    const postsRef = db.ref('posts');
    postsRef.push({
        author: author,
        content: content,
        likes: 0,
        timestamp: Date.now()
    });

    // ফর্ম রিসেট করা
    document.getElementById('postForm').reset();
});

// পোস্ট লোড করা
const postsContainer = document.getElementById('posts');
const postsRef = db.ref('posts');

postsRef.on('child_added', (snapshot) => {
    const post = snapshot.val();
    const postId = snapshot.key;

    // পোস্ট HTML তৈরি করা
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.innerHTML = `
        <h3>${post.author}</h3>
        <p>${post.content}</p>
        <small>${new Date(post.timestamp).toLocaleString()}</small>
        <div class="post-footer">
            <button class="like-btn" onclick="likePost('${postId}')">❤️ Like</button>
            <span id="${postId}-likes">${post.likes} Likes</span>
        </div>
        <div class="comment-section">
            <h4>Comments</h4>
            <form onsubmit="addComment(event, '${postId}')">
                <input type="text" placeholder="Write a comment..." required>
                <button type="submit">Submit</button>
            </form>
            <div id="${postId}-comments"></div>
        </div>
    `;

    // পোস্ট কন্টেইনারে যুক্ত করা
    postsContainer.prepend(postElement);

    // লাইক এবং কমেন্ট লোড করা
    loadLikes(postId);
    loadComments(postId);
});

// লাইক সিস্টেম
function likePost(postId) {
    const postRef = db.ref(`posts/${postId}`);
    postRef.transaction((post) => {
        if (post) {
            post.likes = (post.likes || 0) + 1;
        }
        return post;
    });
}

function loadLikes(postId) {
    const likesRef = db.ref(`posts/${postId}/likes`);
    likesRef.on('value', (snapshot) => {
        const likes = snapshot.val();
        document.getElementById(`${postId}-likes`).textContent = `${likes} Likes`;
    });
}

// কমেন্ট সিস্টেম
function addComment(event, postId) {
    event.preventDefault();
    const commentInput = event.target.querySelector('input');
    const commentText = commentInput.value;

    const commentsRef = db.ref(`comments/${postId}`);
    commentsRef.push({
        text: commentText,
        timestamp: Date.now()
    });

    commentInput.value = '';
}

function loadComments(postId) {
    const commentsContainer = document.getElementById(`${postId}-comments`);
    const commentsRef = db.ref(`comments/${postId}`);

    commentsRef.on('child_added', (snapshot) => {
        const comment = snapshot.val();
        const commentElement = document.createElement('div');
        commentElement.textContent = `${new Date(comment.timestamp).toLocaleString()}: ${comment.text}`;
        commentsContainer.appendChild(commentElement);
    });
}

