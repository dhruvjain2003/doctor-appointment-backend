const pool = require('../config/db');

class Appointment {
    static async create(appointmentData, userId) {
        console.log("User ID:", userId);
        console.log("Appointment data:", appointmentData);
    
        const { doctor_id, slot_id, appointment_date, appointment_type, problem_description } = appointmentData;
        
        if (!doctor_id || !slot_id || !appointment_date || !appointment_type) {
            throw new Error('Missing required fields');
        }

        const existingAppointment = await pool.query(
            `SELECT id FROM appointments 
             WHERE doctor_id = $1 AND slot_id = $2 AND appointment_date = $3 AND status = 'rejected'`,
            [doctor_id, slot_id, appointment_date]
        );

        if (existingAppointment.rows.length > 0) {
            const appointmentId = existingAppointment.rows[0].id;
            await pool.query(
                `UPDATE appointments 
                 SET status = 'pending', user_id = $1, problem_description = $2, appointment_type = $3
                 WHERE id = $4`,
                [userId, problem_description, appointment_type, appointmentId]
            );

            return { message: 'Appointment rescheduled successfully' };
        }

    
        const query = `
            INSERT INTO appointments (user_id, doctor_id, slot_id, appointment_date, appointment_type, problem_description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *`;
        
        const values = [userId, doctor_id, slot_id, appointment_date, appointment_type, problem_description];
    
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    
    static async getPendingAppointments() {
        const query = `
            SELECT 
                a.*,
                u.name as patient_name,
                u.email as patient_email,
                d.name as doctor_name,
                s.slot_time
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.status = 'pending'
            ORDER BY a.appointment_date ASC`;
        
        const result = await pool.query(query);
        return result.rows;
    }

    static async getByUserId(userId) {
        const query = `
            SELECT a.*, d.name as doctor_name, s.slot_time, s.slot_type
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.user_id = $1
            ORDER BY a.appointment_date DESC`;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async getByDoctorId(doctorId) {
        const query = `
            SELECT a.*, u.name as patient_name, s.slot_time, s.slot_type
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.doctor_id = $1
            ORDER BY a.appointment_date DESC`;
        const result = await pool.query(query, [doctorId]);
        return result.rows;
    }

    static async updateStatus(appointmentId, status) {
        const validStatuses = ['pending', 'confirmed', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const query = `
            UPDATE appointments
            SET status = $1
            WHERE id = $2
            RETURNING *`;
        const result = await pool.query(query, [status, appointmentId]);
        return result.rows[0];
    }

    static async getAppointmentDetails(appointmentId) {
        const query = `
            SELECT 
                a.*,
                u.name as patient_name,
                u.email as patient_email,
                d.name as doctor_name,
                s.slot_time,
                s.slot_type
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.id = $1`;
        
        const result = await pool.query(query, [appointmentId]);
        return result.rows[0];
    }
}

module.exports = Appointment;