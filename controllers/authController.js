import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const registerPatient = async (req, res) => {
  const { fullName, email, phone, dateOfBirth, gender, address, password } = req.body;

  try {
    const userExists = await Patient.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const patient = await Patient.create({
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      password,
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        fullName: patient.fullName,
        email: patient.email,
        token: generateToken(patient._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth patient & get token
// @route   POST /api/auth/login
// @access  Public
const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await Patient.findOne({ email });

    if (patient && (await patient.matchPassword(password))) {
      res.json({
        _id: patient._id,
        fullName: patient.fullName,
        email: patient.email,
        token: generateToken(patient._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user._id);

        if (patient) {
            res.json({
                _id: patient._id,
                fullName: patient.fullName,
                email: patient.email,
                phone: patient.phone,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                address: patient.address,
                role: patient.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token (simple random bytes for reset, not JWT)
    // In a real app, you might save this token to the user model with expiration
    // For this implementation, let's assume we just generate a JWT with short expiry for reset
    const resetToken = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: patient.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
        console.error(error);
      res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => { // Expects token in body or query, simpler validation
    const { token, password } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const patient = await Patient.findById(decoded.id);

        if (!patient) {
            return res.status(404).json({ message: 'User not found' });
        }

        patient.password = password; // Will be hashed by pre-save hook
        await patient.save();

        res.status(200).json({ success: true, data: 'Password Reset Success' });

    } catch (error) {
         res.status(400).json({ message: 'Invalid or expired token' });
    }
}

export { registerPatient, loginPatient, getProfile, forgotPassword, resetPassword };
