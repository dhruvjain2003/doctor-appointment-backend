const express = require("express");
const { getAllBlogs, getBlogById } = require("../controllers/blogController");

const router = express.Router();

router.get("/", getAllBlogs); 
router.get("/:id", getBlogById); 

module.exports = router;