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

// Firebase ইনিশিয়ালাইজ
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// পোস্ট সাবমিট করা
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    let imageUrl = null;

    if (imageFile) {
        const storageRef = storage.ref(`images/${Date.now()}_${imageFile.name}`);
        await storageRef.put(imageFile);
        imageUrl = await storageRef.getDownloadURL();
    }

    db.ref('posts').push({
        author,
        content,
        image: imageUrl,
        likes: 0,
        timestamp: Date.now()
    });

    document.getElementById('postForm').reset();
});

// পোস্ট লোড করা
const postsContainer = document.getElementById('posts');
db.ref('posts').on('child_added', (snapshot) => {
    const post = snapshot.val();
    const postId = snapshot.key;

    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.innerHTML = `
        <h3>${post.author}</h3>
        <p>${post.content}</p>
        ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
        <small>${new Date(post.timestamp).toLocaleString()}</small>
        <div class="post-footer">
            <button class="like-btn" onclick="likePost('${postId}')">❤️ Like</button>
            <span id="likes-${postId}">${post.likes} Likes</span>
        </div>
    `;

    postsContainer.prepend(postElement);
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
