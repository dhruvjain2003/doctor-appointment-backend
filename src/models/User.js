const pool = require("../config/db");

class User {
    static async findByEmail(email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        return result.rows[0];
    }

    static async createUser(name, email, hashedPassword, role = "patient") {
        const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, role]
        );
        return result.rows[0];
    }
}

module.exports = User;
