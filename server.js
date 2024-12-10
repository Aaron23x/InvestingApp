const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');


require('dotenv').config();


// Use variables
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;


const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5500', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Registration Endpoint
app.post('/register', async (req, res) => {
    try {
        console.log(req.body);  // Log the form data
        const { username, email, password, confirm_password } = req.body;

        if (!username || !email || !password || !confirm_password) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        if (password !== confirm_password) {
            return res.status(400).send({ error: 'Passwords do not match' });
        }

        // Check if username or email already exists
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).send({ error: 'Username or email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user and save to the database
        const newUser = new User({ username, email, password: hashedPassword });


        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: 'Registration failed' });
    }
});


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Register Endpoint
// app.post('/register', async (req, res) => {
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const newUser = new User({ username: req.body.username, password: hashedPassword });
//         await newUser.save();
//         res.status(201).send({ message: 'User registered successfully' });
//     } catch (error) {
//         res.status(400).send({ error: 'Registration failed' });
//     }
// });

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
