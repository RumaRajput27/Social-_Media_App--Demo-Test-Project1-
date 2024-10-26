const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ruma@123#',
    database: 'image_posts_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Create posts table
const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_link VARCHAR(255) NOT NULL,
        description TEXT NOT NULL
    )
`;
db.query(createPostsTable, (err, result) => {
    if (err) throw err;
    console.log("Posts table created or already exists");
});

// Create comments table
const createCommentsTable = `
    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT,
        comment_text TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
`;
db.query(createCommentsTable, (err, result) => {
    if (err) throw err;
    console.log("Comments table created or already exists");
});

// Endpoint to get all posts
app.get('/api/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint to add a new post
app.post('/api/posts', (req, res) => {
    const { imageLink, description } = req.body;
    const query = 'INSERT INTO posts (image_link, description) VALUES (?, ?)';
    db.query(query, [imageLink, description], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Post added successfully', postId: result.insertId });
    });
});

// Endpoint to delete a post by ID
app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM posts WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Post deleted successfully' });
    });
});

// Endpoint to get comments for a specific post
app.get('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM comments WHERE post_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint to add a new comment to a post
app.post('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const { commentText } = req.body;
    const query = 'INSERT INTO comments (post_id, comment_text) VALUES (?, ?)';
    db.query(query, [id, commentText], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Comment added successfully', commentId: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
