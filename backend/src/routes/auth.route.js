import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);
// logout is post request because we are modifying the server state by clearing the cookie, and it is more secure than using a GET request for logout, as GET requests can be easily triggered by malicious links or scripts, while POST requests require deliberate action from the user.

router.put('/update-profile', protectRoute, updateProfile);
// protectRoute middleware is used to ensure that only authenticated users can access the update profile route. It checks for a valid JWT token in the request cookies and allows access if the token is valid, otherwise it returns an unauthorized error.

router.get('/check', protectRoute, (req, res) => res.status(200).json({ user: req.user }));
export default router;