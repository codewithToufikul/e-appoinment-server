import Doctor from '../models/Doctor.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const department = req.query.department
        ? { department: req.query.department }
        : {};

    // Combine filters
    const filter = { ...keyword, ...department, isActive: true };

    const doctors = await Doctor.find(filter);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
    const {
        name,
        specialization,
        department,
        qualification,
        experience,
        consultationFee,
        profilePhoto,
        availableDays,
        availableTimeSlots,
        email,
        phone,
        bio
    } = req.body;

  try {
    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
        return res.status(400).json({ message: 'Doctor already exists with this email'});
    }

    const doctor = new Doctor({
        name,
        specialization,
        department,
        qualification,
        experience,
        consultationFee,
        profilePhoto,
        availableDays,
        availableTimeSlots,
        email,
        phone,
        bio
    });

    const createdDoctor = await doctor.save();
    res.status(201).json(createdDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      doctor.name = req.body.name || doctor.name;
      doctor.specialization = req.body.specialization || doctor.specialization;
      doctor.department = req.body.department || doctor.department;
      doctor.qualification = req.body.qualification || doctor.qualification;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.consultationFee = req.body.consultationFee || doctor.consultationFee;
      doctor.profilePhoto = req.body.profilePhoto || doctor.profilePhoto;
      doctor.availableDays = req.body.availableDays || doctor.availableDays;
      doctor.availableTimeSlots = req.body.availableTimeSlots || doctor.availableTimeSlots;
      doctor.email = req.body.email || doctor.email;
      doctor.phone = req.body.phone || doctor.phone;
      doctor.bio = req.body.bio || doctor.bio;
      doctor.isActive = req.body.isActive !== undefined ? req.body.isActive : doctor.isActive;

      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      await doctor.deleteOne();
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
