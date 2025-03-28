require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const pool = require("./src/config/db");
const passport = require("./src/config/passport");
const authRoutes = require("./src/routes/authRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const slotRoutes = require("./src/routes/slotRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json());

app.use('/api/slots', slotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api", adminRoutes);
app.use("/api/reviews", reviewRoutes);
async function createAdminUser() {
  try {
    const result = await pool.query("SELECT * FROM users WHERE role = $1", ["admin"]);
    
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Admin", "admin@gmail.com", hashedPassword, "admin"]
      );
      console.log("Default admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createAdminUser();
});
