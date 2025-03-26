const express = require('express');
const { createAppointment, getUserAppointments, getDoctorAppointments, updateAppointmentStatus, getPendingAppointments } = require('../controllers/appointmentController.js');
const { authenticateUser } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', authenticateUser, createAppointment);
router.get('/user', authenticateUser, getUserAppointments);
router.get('/doctor/:doctorId', authenticateUser, getDoctorAppointments);
router.get('/pending', authenticateUser, getPendingAppointments);
router.patch('/:id/status', authenticateUser, updateAppointmentStatus);

module.exports = router; 
