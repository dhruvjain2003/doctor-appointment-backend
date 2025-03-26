const Appointment = require("../models/Appointment");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authenticated request
    console.log("Creating appointment for User ID:", userId);

    const appointment = await Appointment.create(req.body, userId);
    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getByUserId(req.user.id);
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getByDoctorId(req.params.doctorId);
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getPendingAppointments();
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get appointment details before updating status
    const appointmentDetails = await Appointment.getAppointmentDetails(id);
    if (!appointmentDetails) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Update appointment status
    const appointment = await Appointment.updateStatus(id, status);

    // Send email to patient
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: appointmentDetails.patient_email,
      subject: `Appointment ${status}`,
      text: `Dear ${appointmentDetails.patient_name},

Your appointment with Dr. ${appointmentDetails.doctor_name} has been ${status}.

Appointment Details:
Date: ${appointmentDetails.appointment_date}
Time: ${appointmentDetails.slot_time}
Type: ${appointmentDetails.appointment_type}

${
  status === "confirmed"
    ? "Please arrive 15 minutes before your appointment time."
    : "Please book another appointment at your convenience."
}

Thank you for choosing our service.`,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
};
