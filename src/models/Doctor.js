const pool = require("../config/db");

class Doctor {
  static async getAllDoctors() {
    const result = await pool.query(
      "SELECT * FROM doctors ORDER BY rating DESC"
    );
    return result.rows;
  }

  static async getDoctorById(id) {
    const result = await pool.query("SELECT * FROM doctors WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }
  static async searchDoctors(query) {
    // console.log("Search query:", query);
    const result = await pool.query(
      "SELECT * FROM doctors WHERE name ILIKE $1 OR specialty ILIKE $1 ORDER BY rating DESC",
      [`%${query}%`]
    );
    // console.log(result.rows);
    return result.rows;
  }

  static async filterDoctors(filters) {
    const { rating, experience, gender } = filters;
    console.log("Received filters:", filters);
    let query = "SELECT * FROM doctors WHERE 1=1";
    const values = [];
    let paramIndex = 1;
  
    if (rating && rating !== -1) {
      query += ` AND rating = $${paramIndex}`;
      values.push(rating);
      paramIndex++;
    }
  
    if (Array.isArray(experience) && experience.length === 2) {
      const [min, max] = experience.map(Number);
      console.log(min,max);
      query += ` AND experience BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      values.push(min, max);
      paramIndex += 2;
  }
  
    if (gender && gender !== -1) {
      query += ` AND gender = $${paramIndex}`;
      values.push(gender);
      paramIndex++;
    }
  
    query += " ORDER BY rating DESC";
    console.log('SQL Query:', query, 'Values:', values);
  
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Doctor;
