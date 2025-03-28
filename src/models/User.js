const pool = require("../config/db");

class User {

    static async findById(id) {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        return result.rows[0];
    }

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

    static async getUserById(userId) {
        const query = `
            SELECT name, email, phone, address, weight, height, blood_group as "bloodGroup"
            FROM users 
            WHERE id = $1`;
        
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    static async updateUser(userId, updateData) {
        const { phone, address, weight, height, bloodGroup } = updateData;
        
        let updateFields = [];
        let values = [];
        let paramCount = 1;

        if (phone !== undefined) {
            updateFields.push(`phone = $${paramCount}`);
            values.push(phone);
            paramCount++;
        }
        if (address !== undefined) {
            updateFields.push(`address = $${paramCount}`);
            values.push(address);
            paramCount++;
        }
        if (weight !== undefined) {
            updateFields.push(`weight = $${paramCount}`);
            values.push(weight);
            paramCount++;
        }
        if (height !== undefined) {
            updateFields.push(`height = $${paramCount}`);
            values.push(height);
            paramCount++;
        }
        if (bloodGroup !== undefined) {
            updateFields.push(`blood_group = $${paramCount}`);
            values.push(bloodGroup);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return await this.getUserById(userId);
        }

        values.push(userId);
        
        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING name, email, phone, address, weight, height, blood_group as "bloodGroup"`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteUser(userId) {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id",
            [userId]
        );
        return result.rows[0];
    }
}

module.exports = User;
