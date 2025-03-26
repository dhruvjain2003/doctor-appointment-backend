const pool = require("../config/db");

const getSlotsByDoctor = async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    try {
        const query = `
            SELECT s.id, 
                   TO_CHAR(s.slot_time, 'HH24:MI:SS') as slot_time,
                   s.slot_type,
                   CASE 
                       WHEN a.id IS NULL THEN true 
                       WHEN a.status = 'rejected' THEN true
                       ELSE false 
                   END as available
            FROM slots s
            LEFT JOIN appointments a ON 
                s.id = a.slot_id 
                AND a.doctor_id = s.doctor_id 
                AND a.appointment_date = $2
            WHERE s.doctor_id = $1
            ORDER BY s.slot_time;
        `;

        const result = await pool.query(query, [doctorId, date]);
        
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching slots'
        });
    }
};

module.exports = {getSlotsByDoctor};