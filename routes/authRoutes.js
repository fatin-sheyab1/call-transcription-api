const express = require("express");

const {
    register,
    login,
    getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: salma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: salma@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "12345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid or missing input
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and return a JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: salma@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Login successful and JWT returned
 *       400:
 *         description: Invalid or missing input
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);


/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user returned successfully
 *       401:
 *         description: Invalid, expired, or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/me", authMiddleware, getMe);


module.exports = router;