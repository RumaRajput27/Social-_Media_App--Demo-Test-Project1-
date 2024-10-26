// Fetch and display posts from the database
function fetchPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                createPost(post);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
}

// Function to create and display a single post

function createPost(post) {
    const postContainer = document.createElement('div');
    postContainer.classList.add('post');
    postContainer.innerHTML = `
        <img src="${post.image_link}" alt="Post image">
        <p>${post.description}</p>
        <button class="delete-button" data-id="${post.id}">
             <i class="fa-solid fa-xmark"></i> <!-- Font Awesome delete icon -->
        </button>
        <div>
            <h4>Comments</h4>
            <div id="comment-list-${post.id}" class="comment-list"></div>
            <form id="comment-form-${post.id}" class="comment-form">
                <input type="text" id="comment-input-${post.id}" placeholder="Write a comment...">
                <button type="submit">Submit</button>
            </form>
        </div>
    `;

    document.getElementById('posts').appendChild(postContainer);

    // Fetch comments when the post is created
    fetchComments(post.id);

    // Add event listener to the comment form
    const commentForm = document.getElementById(`comment-form-${post.id}`);
    commentForm.addEventListener('submit', (event) => handleCommentSubmit(event, post.id));

    // Add event listener to the delete button
    const deleteButton = postContainer.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => deletePost(post.id));
}


// Function to fetch comments for a specific post
function fetchComments(postId) {
    fetch(`/api/posts/${postId}/comments`)
        .then(response => response.json())
        .then(comments => {
            const commentList = document.getElementById(`comment-list-${postId}`);
            commentList.innerHTML = '';  // Clear previous comments

            comments.forEach(comment => {
                const commentItem = document.createElement('div');
                commentItem.classList.add('comment-item');
                commentItem.textContent = comment.comment_text;
                commentList.appendChild(commentItem);
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
}

// Function to submit a new comment
function submitComment(postId, commentText) {
    fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentText })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Comment added:', data);
        fetchComments(postId);  // Refresh comments after submission
    })
    .catch(error => console.error('Error submitting comment:', error));
}

// Handle comment form submission
function handleCommentSubmit(event, postId) {
    event.preventDefault();
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentText = commentInput.value.trim();

    if (commentText) {
        submitComment(postId, commentText);
        commentInput.value = '';  // Clear the input field
    }
}

// Function to delete a post
function deletePost(postId) {
    fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        const postElement = document.querySelector(`.delete-button[data-id='${postId}']`).parentElement;
        postElement.remove(); // Remove the post element from the DOM
    })
    .catch(error => console.error('Error deleting post:', error));
}

// Function to add a new post
function addPost(event) {
    event.preventDefault();
    const imageLinkInput = document.getElementById('image-link');
    const descriptionInput = document.getElementById('description');

    const newPost = {
        imageLink: imageLinkInput.value.trim(),
        description: descriptionInput.value.trim(),
    };

    if (newPost.imageLink && newPost.description) {
        fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Post added:', data);
            createPost({ id: data.postId, ...newPost }); // Create post element on success
            imageLinkInput.value = ''; // Clear the input field
            descriptionInput.value = ''; // Clear the input field
        })
        .catch(error => console.error('Error adding post:', error));
    }
}

// Event listener for adding a new post
document.getElementById('post-form').addEventListener('submit', addPost);

// Initial fetch to load posts when the page is loaded
fetchPosts();
