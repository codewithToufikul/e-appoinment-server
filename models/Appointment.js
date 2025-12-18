import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String, // e.g., '09:00 - 09:30'
      required: true,
    },
    appointmentNumber: {
      type: String,
      unique: true,
    },
    reasonForVisit: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double booking: 1 doctor cannot have 2 appointments at the same date & timeSlot
// Note: We'll also handle this in the controller for better error messages
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
