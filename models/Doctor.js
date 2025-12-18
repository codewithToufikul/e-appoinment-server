import mongoose from 'mongoose';

const doctorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    profilePhoto: {
      type: String, // URL to image
    },
    availableDays: {
      type: [String], // e.g., ['Monday', 'Tuesday']
      required: true,
    },
    availableTimeSlots: [
      {
        start: { type: String, required: true }, // e.g. "09:00"
        end: { type: String, required: true },   // e.g. "09:30"
      },
    ],
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
