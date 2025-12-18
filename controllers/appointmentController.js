import Appointment from '../models/Appointment.js';

import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import sendEmail from '../utils/sendEmail.js';
import { appointmentConfirmation, statusUpdate } from '../utils/emailTemplates.js';

// Helper to generate appointment number
const generateAppointmentNumber = () => {
    return 'APT-' + Math.floor(100000 + Math.random() * 900000); // Simple 6 digit random
};

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private (Patient)
const bookAppointment = async (req, res) => {
    const { doctorId, appointmentDate, timeSlot, reasonForVisit } = req.body;

    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if date is available for doctor
        // In real app, check 'doctor.availableDays' vs 'appointmentDate' day of week

        // Check availability
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate,
            timeSlot,
            status: { $ne: 'Cancelled' } // Allow rebooking if previous one was cancelled
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'Time slot already booked' });
        }

        const appointment = new Appointment({
            patient: req.user._id,
            doctor: doctorId,
            appointmentDate,
            timeSlot,
            reasonForVisit,
            appointmentNumber: generateAppointmentNumber(),
            status: 'Pending'
        });

        const createdAppointment = await appointment.save();

        // Send Email Notification
        try {
            const patient = await Patient.findById(req.user._id); // Assuming req.user is populated, but better safe
            await sendEmail({
                email: patient.email,
                subject: 'Appointment Confirmation',
                html: appointmentConfirmation({
                    patientName: patient.fullName,
                    doctorName: doctor.name,
                    date: appointmentDate,
                    time: timeSlot,
                    appointmentNumber: createdAppointment.appointmentNumber
                })
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails, but log it
        }

        res.status(201).json(createdAppointment);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/appointments/available-slots
// @access  Public
const getAvailableSlots = async (req, res) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        return res.status(400).json({ message: 'Doctor ID and Date are required' });
    }

    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get all booked appointments for this doctor on this date
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: date,
            status: { $ne: 'Cancelled' }
        }).select('timeSlot');

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);

        // Filter doctor's total slots -> remove booked slots
        // Note: For simplicity, assuming doctor.availableTimeSlots has { start: '09:00', end: '09:30' } format
        // And we compare strictly strings. In prod, use standard time comparison.
        
        const allSlots = doctor.availableTimeSlots.map(slot => `${slot.start} - ${slot.end}`);
        
        // This is a simplified logic. Real world needs precise date/time parsing
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        
        // If your doctor model stores slots as objects {start, end}, map them to a string for comparison or send them as objects
        // Let's assume the frontend sends/expects exact strings matching what's in Doctor model

        res.json(availableSlots);

    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

// @desc    Get logged in patient appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name specialization profilePhoto')
            .sort({ appointmentDate: -1 }); // Newest first
        res.json(appointments);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
             .populate('doctor', 'name specialization')
             .populate('patient', 'fullName email phone');

        if (appointment) {
             // Access check: Only the patient or admin can view
             // simplified: req.user._id === appointment.patient._id or req.user.role === admin
            res.json(appointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update appointment status (Cancel/Confirm)
// @route   PUT /api/appointments/:id/status
// @access  Private (Patient/Admin)
const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body; // 'Cancelled' or 'Confirmed' or 'Completed'

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Logic restrictions can go here (e.g. only admin can Confirm)
        
        appointment.status = status;
        const updatedAppointment = await appointment.save();

        // Send Status Update Email
        try {
             const patient = await Patient.findById(appointment.patient);
             if (patient) {
                 await sendEmail({
                    email: patient.email,
                     subject: `Appointment ${status}`,
                     html: statusUpdate({
                         patientName: patient.fullName,
                         appointmentNumber: appointment.appointmentNumber,
                         status: status
                     })
                 });
             }
        } catch (emailError) {
             console.error('Email sending failed:', emailError);
        }

        res.json(updatedAppointment);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get ALL appointments (Admin)
// @route   GET /api/appointments/all
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('doctor', 'name specialization')
            .populate('patient', 'fullName email')
            .sort({ appointmentDate: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export {
    bookAppointment,
    getAvailableSlots,
    getMyAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    getAllAppointments
};
