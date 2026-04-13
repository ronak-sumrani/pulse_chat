import jwt from "jsonwebtoken";

// Function to generate JWT token for user authentication
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // cookie cannot be accessed by client-side JavaScript // prevents XSS attacks: cross-site scripting attacks where malicious scripts try to access cookies
        sameSite: 'strict', // cookie will only be sent in a first-party context (not sent with cross-site requests) // prevents CSRF attacks: cross-site request forgery attacks where malicious sites try to perform actions on behalf of authenticated users
        secure: process.env.NODE_ENV === 'development' ? false : true, // cookie will only be sent over HTTPS in production
    });

    return token;
}