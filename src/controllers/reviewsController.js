require("dotenv").config();
const pool = require("../config/db");

const createReview = async (req, res) => {
  try {
    const { appointment_id, doctor_id, rating, comment } = req.body;
    const user_id = req.user.id;
    if (!appointment_id || !doctor_id || !rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }
    const checkAppointment = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND user_id = $2 AND status = 'completed'",
      [appointment_id, user_id]
    );

    if (checkAppointment.rows.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or incomplete appointment.",
        });
    }
    const newReview = await pool.query(
      `INSERT INTO reviews (appointment_id, doctor_id, user_id, rating, comment, created_at) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [appointment_id, doctor_id, user_id, rating, comment]
    );

    res
      .status(201)
      .json({
        success: true,
        message: "Review submitted successfully",
        review: newReview.rows[0],
      });
  } catch (error) {
    console.error("Error adding review:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.doctor_id = $1 
       ORDER BY r.created_at DESC`,
      [doctorId]
    );

    res.status(200).json({
      success: true,
      reviews: reviews.rows
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        d.name as doctor_name
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       JOIN doctors d ON r.doctor_id = d.id 
       ORDER BY r.created_at DESC`
    );

    console.log("Fetched reviews:", reviews.rows); 

    res.status(200).json({
      success: true,
      reviews: reviews.rows
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createReview, getDoctorReviews, getAllReviews };
