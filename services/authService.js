const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = async ({ username, email, password }) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
    };
};


const loginUser = async ({ email, password }) => {

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return null;
    }

    const passwordIsCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordIsCorrect) {
        return null;
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token,
    };
};

const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};


module.exports = {
    registerUser,
    loginUser,
    getUserById,
};