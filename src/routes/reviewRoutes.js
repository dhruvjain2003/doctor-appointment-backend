const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { createReview, getDoctorReviews, getAllReviews } = require("../controllers/reviewsController");

router.post("/", authenticateUser, createReview);
router.get("/doctor/:doctorId", getDoctorReviews);
router.get("/", getAllReviews);

module.exports = router;
