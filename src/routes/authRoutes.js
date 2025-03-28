const express = require("express");
const { signup, login,forgotPassword,resetPassword,getUserDetails,updateUserDetails,deleteUser } = require("../controllers/authController");
const {authenticateUser} = require("../middleware/authMiddleware");
const router = express.Router();
const passport = require("passport");

router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })
);
  
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      if (!req.user || !req.user.token) {
        return res.redirect(
          `http://localhost:3000//login?error=Authentication Failed`
        );
      }
      res.redirect(`http://localhost:3000//login?token=${req.user.token}`);
    }
);

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);   
router.get("/user/details", authenticateUser, getUserDetails);
router.put("/user/update", authenticateUser, updateUserDetails);
router.delete("/user/delete", authenticateUser, deleteUser);  

module.exports = router;
