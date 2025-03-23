const Blog = require("../models/Blog");

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.getAllBlogs();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.getBlogById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllBlogs, getBlogById };