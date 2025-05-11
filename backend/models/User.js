const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'parent'],
        required: true
    },
    dob: {
        type: Date,
        required: function() { return this.role === 'student'; },
        validate: {
            validator: function(v) {
                if (this.role === 'student') {
                    // Ensure student is at least 5 years old
                    const minAge = new Date();
                    minAge.setFullYear(minAge.getFullYear() - 5);
                    return v <= minAge;
                }
                return true;
            },
            message: 'Student must be at least 5 years old'
        }
    },
    address: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return this.role === 'student'; },
        default: null,
    },
    guardian: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    fingerprintData: {
        type: String,
        default: null
    },
    faceData: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;