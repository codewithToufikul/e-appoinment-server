export const appointmentConfirmation = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmed</h2>
      <p>Dear ${data.patientName},</p>
      <p>Your appointment has been successfully booked.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Appointment Number:</strong> ${data.appointmentNumber}</p>
        <p><strong>Doctor:</strong> ${data.doctorName}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
      </div>

      <p>Please arrive 15 minutes before your scheduled time.</p>
      <p>Best regards,<br>e-Appointment Team</p>
    </div>
  `;
};

export const statusUpdate = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Update</h2>
      <p>Dear ${data.patientName},</p>
      <p>The status of your appointment (Ref: ${data.appointmentNumber}) has changed.</p>
      
      <div style="background-color: ${
        data.status === 'Confirmed' ? '#dcfce7' : '#fee2e2'
      }; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>New Status:</strong> ${data.status.toUpperCase()}</p>
      </div>

      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br>e-Appointment Team</p>
    </div>
  `;
};
