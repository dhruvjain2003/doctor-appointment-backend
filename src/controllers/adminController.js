require("dotenv").config();
const pool = require("../config/db");

const createDoctor = async (doctor) => {
  const { name, specialty, experience, rating, gender, profile_image_url } = doctor;
  console.log("Received doctor data:", doctor);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const doctorQuery = `
      INSERT INTO doctors (name, specialty, experience, rating, gender, profile_image) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

    const doctorValues = [name, specialty, experience, rating, gender, profile_image_url];
    const doctorResult = await client.query(doctorQuery, doctorValues);
    const newDoctor = doctorResult.rows[0];
    const slots = [
      { time: '09:00:00', type: 'morning' },
      { time: '09:30:00', type: 'morning' },
      { time: '10:00:00', type: 'morning' },
      { time: '10:30:00', type: 'morning' },
      { time: '11:00:00', type: 'morning' },
      { time: '11:30:00', type: 'morning' },
      { time: '12:00:00', type: 'morning' },
      { time: '12:30:00', type: 'morning' },
      { time: '16:30:00', type: 'evening' },
      { time: '17:00:00', type: 'evening' },
      { time: '17:30:00', type: 'evening' },
      { time: '18:00:00', type: 'evening' },
      { time: '18:30:00', type: 'evening' },
      { time: '19:00:00', type: 'evening' },
      { time: '19:30:00', type: 'evening' },
      { time: '20:00:00', type: 'evening' }
    ];

    const slotQuery = `
      INSERT INTO slots (doctor_id, slot_time, slot_type)
      VALUES ($1, $2, $3)`;

    for (const slot of slots) {
      await client.query(slotQuery, [newDoctor.id, slot.time, slot.type]);
    }

    await client.query('COMMIT');
    console.log("Inserted doctor and slots successfully");

    return newDoctor;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    client.release();
  }
};

const getDashboardStats = async (req, res) => {
  try {
      const totalDoctors = await pool.query("SELECT COUNT(*) FROM doctors");
      const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
      res.json({
          totalDoctors: totalDoctors.rows[0].count,
          totalUsers: totalUsers.rows[0].count
      });
  } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createDoctor,getDashboardStats };
