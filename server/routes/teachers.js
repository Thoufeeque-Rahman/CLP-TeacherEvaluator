const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teachers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");    
const { body, validationResult } = require("express-validator");


// Login
router.post(
    "/login",
    [
        body("phone", "Phone number is required").isMobilePhone(),
        body("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, password } = req.body;

        try {
            const teacher = await Teacher.findOne({ phone });
            if (!teacher) {
                return res.status(404).json({ error: "Teacher not found" });
            }

            const isMatch = await bcrypt.compare(password, teacher.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const payload = {
                teacher: {
                    id: teacher.id,
                },
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });

            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);



module.exports = router;
