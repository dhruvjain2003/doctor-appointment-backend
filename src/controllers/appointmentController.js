const Appointment = require("../models/Appointment");
const nodemailer = require("nodemailer");
const pool = require("../config/db");
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
    const userId = req.user.id; 
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
    const appointmentDetails = await Appointment.getAppointmentDetails(id);
    if (!appointmentDetails) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    const appointment = await Appointment.updateStatus(id, status);
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

const getConfirmedAppointments = async(req,res) =>{
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as patient_name,
        d.name as doctor_name,
        s.slot_time,
        s.slot_type
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN slots s ON a.slot_id = s.id
      WHERE a.status = 'confirmed'
      ORDER BY a.appointment_date ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
      console.error("Error fetching confirmed appointments:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
}

const changeToConfirmed = async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query(
          "UPDATE appointments SET status = 'completed' WHERE id = $1 RETURNING *",
          [id]
      );
      if (result.rowCount === 0) {
          return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      res.json({ success: true, message: "Appointment marked as completed" });
  } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
  getConfirmedAppointments,
  changeToConfirmed
};
