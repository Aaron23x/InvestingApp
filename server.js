const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const bodyParser = require('body-parser');



require('dotenv').config();


// Use variables
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const stripe = require("stripe")("sk_test_51Lu5VIBwXI86QYpBZcmdNs8StuzrLKQBKr3aVarNBSKcQtiY0ZubAuIC6asQMgUutPPagaxE4PSYxqfbMUuVaom900zsl8s6Kp");


const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5500', methods: ['GET', 'POST', 'DELETE'], allowedHeaders: ['Content-Type'] }));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirm_password: { type: String, required: true }
});

// Post Schema
const postSchema = new mongoose.Schema({
    content: String,
    category: String,
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
});

const Post = mongoose.model("Post", postSchema);

// Get all posts
app.get("/communityboard", async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send({ error: 'Error fetching posts' });
    }
});


// Create a new post
app.post("/communityboard", async (req, res) => {
    console.log("Received a post request");

    try {
        const { content, category } = req.body;
        const newPost = new Post({ content, category });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send({ error: 'Error creating post' });
    }
});

// Delete a post
app.delete("/communityboard/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting post with ID:", id);


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid post ID' });
        }

        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).send({ error: 'Post not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).send({ error: 'Error deleting post' });
    }
});

// Registration Endpoint
app.post('/register', async (req, res) => {
    try {
        console.log(req.body);
        const { email, username, password, confirm_password } = req.body;

        if (!email || !username || !password || !confirm_password) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        if (password !== confirm_password) {
            return res.status(400).send({ error: 'Passwords do not match' });
        }

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).send({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({ username, email, password: hashedPassword });


        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: 'Registration failed' });
    }
});

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price: "price_1QmlSbBwXI86QYpBF0AniqSM", // Replace with your Stripe Price ID
                quantity: 1,
            }],
            mode: "subscription",
            success_url: "http://127.0.0.1:5500/success.html",
            cancel_url: "http://127.0.0.1:5500/cancel.html",
        });
        console.log("Session ID:", session.id); // Log the session ID
        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/create-checkout-session-institutional", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price: "price_1Qmlo2BwXI86QYpBnhhMFTtW", // Institutional Plan Price ID
                quantity: 1,
            }],
            mode: "subscription",
            success_url: "http://127.0.0.1:5500/success.html",
            cancel_url: "http://127.0.0.1:5500/cancel.html",
        });
        console.log("Session ID:", session.id); // Log the session ID
        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating institutional session:", error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(4242, () => console.log("Server running on port 4242"));


app.get('/', (req, res) => {
    res.send('Server is running...');
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).send({ token, username: user.username, message: 'Login successful' });
        }
        return res.status(400).send({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).send({ error: 'Server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
