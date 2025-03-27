require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

module.exports = { createDoctor };
