import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);
// logout is post request because we are modifying the server state by clearing the cookie, and it is more secure than using a GET request for logout, as GET requests can be easily triggered by malicious links or scripts, while POST requests require deliberate action from the user.

export default router;