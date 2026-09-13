const authService = require("../services/authService");


const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    if (typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await authService.registerUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {

    if (error.message === "Email already exists") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        message: "Password must be a string",
      });
    }

    const result = await authService.loginUser({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await authService.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            user,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = {
  register,
  login,
    getMe,
};