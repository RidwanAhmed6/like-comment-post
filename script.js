// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrmbAsLvAWY9nE7a3u3pbNQqDf6zAy248",
    authDomain: "like-comment-post.firebaseapp.com",
    databaseURL: "https://like-comment-post-default-rtdb.firebaseio.com",
    projectId: "like-comment-post",
    storageBucket: "like-comment-post.appspot.com",
    messagingSenderId: "469584146209",
    appId: "1:469584146209:web:164c11d771757d77b09860"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);
const storage = firebase.storage(app);

// Imgur API Client ID
const IMGUR_CLIENT_ID = '4d8fd349e145537';

// পোস্ট ফর্ম সাবমিট
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    let imageUrl = null;

    if (imageFile) {
        // Imgur API দিয়ে ছবি আপলোড করা
        imageUrl = await uploadImageToImgur(imageFile);
    }

    // নতুন পোস্ট ডেটা
    const newPost = {
        author,
        content,
        image: imageUrl || null,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
    };

    // ডেটাবেসে সেভ
    database.ref('posts').push(newPost);

    document.getElementById('postForm').reset();
});

// Imgur API দিয়ে ছবি আপলোড করার ফাংশন
async function uploadImageToImgur(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.link;  // ছবির URL ফেরত দিবে
        } else {
            throw new Error('Imgur upload failed');
        }
    } catch (error) {
        console.error('Error uploading image to Imgur:', error);
        return null;
    }
}

// পোস্ট রেন্ডার করা
const renderPosts = () => {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    database.ref('posts').on('value', (snapshot) => {
        const posts = snapshot.val();
        if (posts) {
            Object.keys(posts).forEach((key) => {
                const post = posts[key];
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <h3>${post.author}</h3>
                    <p>${post.content}</p>
                    ${
                        post.image
                            ? `<img src="${post.image}" alt="Post Image" style="width:100%; max-width:500px; height:auto;">`
                            : ''
                    }
                    <small>${new Date(post.timestamp).toLocaleString()}</small>
                    <div class="post-footer">
                        <button onclick="likePost('${key}')">❤️ Like</button>
                        <span>${post.likes} Likes</span>
                    </div>
                    <div class="comments">
                        <h4>Comments:</h4>
                        <ul id="comments-${key}">
                            ${post.comments
                                .map(
                                    (comment) =>
                                        `<li><strong>${comment.author}:</strong> ${comment.text}</li>`
                                )
                                .join('')}
                        </ul>
                        <input type="text" id="comment-input-${key}" placeholder="Write a comment...">
                        <button onclick="addComment('${key}')">Add Comment</button>
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });
        }
    });
};

// কমেন্ট ফাংশন
const addComment = (postId) => {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentText = commentInput.value;

    if (commentText) {
        const postRef = database.ref(`posts/${postId}`);
        postRef.get().then((snapshot) => {
            const post = snapshot.val();
            const updatedComments = post.comments || [];
            updatedComments.push({ author: 'Anonymous', text: commentText });

            postRef.update({ comments: updatedComments });
        });
        commentInput.value = '';
    }
};

// লাইক ফাংশন
const likePost = (postId) => {
    const postRef = database.ref(`posts/${postId}`);
    postRef.get().then((snapshot) => {
        const post = snapshot.val();
        postRef.update({ likes: post.likes + 1 });
    });
};

// রেন্ডার পোস্টস
renderPosts();
