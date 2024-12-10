import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../utils/mongodb'; // A utility to connect to your MongoDB

const JWT_SECRET = process.env.JWT_SECRET; // Make sure your JWT_SECRET is in your environment variables

export default async function handler(req, res) {
    // Check for POST method
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            // Connect to the database
            const { db } = await connectToDatabase();
            const user = await db.collection('users').findOne({ username });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create JWT token
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

            // Send response with token and username
            return res.status(200).json({
                token,
                username: user.username,
                message: 'Login successful',
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
