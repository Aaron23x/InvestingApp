import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });

            if (user && (await bcrypt.compare(password, user.password))) {
                const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
                return res.status(200).json({ token, username: user.username, message: 'Login successful' });
            }
            return res.status(400).json({ error: 'Invalid credentials' });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
