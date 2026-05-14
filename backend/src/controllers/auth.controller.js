import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    // check if emails is valid: regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // check if user already exists in the database
    const user = await User.findOne({email});
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    if(newUser) {
      // before
      // // authenticate user and generate token
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        // Send welcome email after successful signup
        await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error('Error sending welcome email:', error);
      }
    }else{
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.log('Error in login controller:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt","", { maxAge: 0 }); // Clear the cookie by setting it to an empty string and expiring it immediately
  res.status(200).json({ message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if(!profilePic) return res.status(400).json({ message: 'Profile picture is required' });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}