require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createDoctor = async (doctor) => {
  const { name, specialty, experience, rating, gender, profile_image_url } = doctor;
  console.log("Received doctor data:", doctor);

  const query = `
    INSERT INTO doctors (name, specialty, experience, rating, gender, profile_image) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

  const values = [name, specialty, experience, rating, gender, profile_image_url];
  console.log("Values to be inserted:", values);

  try {
    const result = await pool.query(query, values);
    console.log("Inserted doctor:", result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error("Error inserting doctor:", error);
    throw error;
  }
};

module.exports = { createDoctor };
