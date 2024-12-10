const mongoose = require('mongoose');

// User Schema definition
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { collection: 'marketmayhem' });  // Specify the collection name here

// Creating a User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
