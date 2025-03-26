const express = require("express");
const { signup, login,forgotPassword,resetPassword,getUserDetails,updateUserDetails,deleteUser } = require("../controllers/authController");
const {authenticateUser} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);   
router.get("/user/details", authenticateUser, getUserDetails);
router.put("/user/update", authenticateUser, updateUserDetails);
router.delete("/user/delete", authenticateUser, deleteUser);  

module.exports = router;
