import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // 1. Create Admin
    const adminExists = await Admin.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
        const admin = new Admin({
            username: 'SuperAdmin',
            email: 'admin@example.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'admin'
        });
        await admin.save();
        console.log('Admin created: admin@example.com / password123');
    } else {
        console.log('Admin already exists');
    }

    // 2. Create Sample Doctor
    const doctorExists = await Doctor.findOne({ email: 'dr.smith@example.com' });
    if (!doctorExists) {
        const doctor = new Doctor({
            name: 'Dr. John Smith',
            specialization: 'Cardiology',
            department: 'Cardiology',
            qualification: 'MBBS, MD',
            experience: 15,
            consultationFee: 150,
            availableDays: ['Monday', 'Wednesday', 'Friday'],
            availableTimeSlots: [
                { start: '09:00', end: '09:30' },
                { start: '10:00', end: '10:30' },
                { start: '11:00', end: '11:30' }
            ],
            email: 'dr.smith@example.com',
            phone: '123-456-7890',
            bio: 'Expert Cardiologist with over 15 years of experience.'
        });
        await doctor.save();
        console.log('Sample Doctor created: Dr. John Smith');
    } else {
        console.log('Doctor already exists');
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
