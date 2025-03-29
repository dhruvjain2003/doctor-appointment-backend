const express = require("express");
const upload = require("../middleware/upload"); 
const { createDoctor,getDashboardStats } = require("../controllers/adminController"); 

const router = express.Router();

router.post("/admin/add-doctor", upload.single("profile_image"), async (req, res) => {
  try {
    const { name, specialty, experience, rating, gender } = req.body;
    const profile_image_url = req.file ? req.file.path : null;

    if (!name || !specialty || !experience || !rating || !gender || !profile_image_url) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const doctor = await createDoctor({ name, specialty, experience, rating, gender, profile_image_url });

    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", getDashboardStats);

module.exports = router;
