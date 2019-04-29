const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Anonymous',
            trim: true,
        },
        age: {
            type: Number,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number');
                }
            },
            trim: true,
            default: 0,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate(value) {
                if (!isEmail(value)) {
                    throw new Error('Email is invalid');
                }
            },
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error(
                        'Password must not contain word "Password"',
                    );
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.pre('remove', async function(next) {
    await Task.deleteMany({ owner: this._id });
    next();
});

userSchema.methods.generateAuthToken = async function() {
    const token = await jwt.sign(
        { _id: this._id.toString() },
        process.env.JWT_SECRET_KEY,
    );

    this.tokens.push({
        token,
    });

    await this.save();

    return token;
};

userSchema.methods.toJSON = function() {
    const userObj = this.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
