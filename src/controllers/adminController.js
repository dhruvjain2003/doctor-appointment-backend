require("dotenv").config();
const pool = require("../config/db");

const createDoctor = async (doctor) => {
  const { 
    name, 
    specialty, 
    experience, 
    rating, 
    gender, 
    profile_image_url, 
    degree, 
    consultation_fee, 
    contact_number 
  } = doctor;

  console.log("Received doctor data:", doctor);

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const doctorQuery = `
      INSERT INTO doctors (name, specialty, experience, rating, gender, profile_image, degree, consultation_fee, contact_number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

    const doctorValues = [
      name, 
      specialty, 
      experience, 
      rating, 
      gender, 
      profile_image_url, 
      degree, 
      consultation_fee, 
      contact_number ? contact_number : null 
    ];

    const doctorResult = await client.query(doctorQuery, doctorValues);
    const newDoctor = doctorResult.rows[0];

    const slots = [
      ['09:00:00', 'morning'],
      ['09:30:00', 'morning'],
      ['10:00:00', 'morning'],
      ['10:30:00', 'morning'],
      ['11:00:00', 'morning'],
      ['11:30:00', 'morning'],
      ['12:00:00', 'morning'],
      ['12:30:00', 'morning'],
      ['16:30:00', 'evening'],
      ['17:00:00', 'evening'],
      ['17:30:00', 'evening'],
      ['18:00:00', 'evening'],
      ['18:30:00', 'evening'],
      ['19:00:00', 'evening'],
      ['19:30:00', 'evening'],
      ['20:00:00', 'evening']
    ];

    const slotQuery = `
      INSERT INTO slots (doctor_id, slot_time, slot_type) 
      VALUES ${slots.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ")}
    `;

    const slotValues = [newDoctor.id, ...slots.flat()];
    await client.query(slotQuery, slotValues);

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
