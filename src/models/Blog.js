const pool = require("../config/db");

class Blog {
    static async getAllBlogs() {
        const result = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC");
        return result.rows;
    }

    static async getBlogById(id) {
        const result = await pool.query("SELECT * FROM blogs WHERE id = $1", [id]);
        return result.rows[0];
    }
}

module.exports = Blog;