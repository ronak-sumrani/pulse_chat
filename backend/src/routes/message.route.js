import express from 'express';
import { getAllContacts, getMessageByUserId, sendMessage, getChatPartners} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

// the order of middleware is important, we want to apply arcjetProtection before protectRoute, so that we can block malicious requests before checking for authentication
router.use(arcjetProtection, protectRoute); 

router.get('/contacts', getAllContacts);
router.get('/chats', getChatPartners);
router.get('/:id', getMessageByUserId);
router.post('/send/:id', sendMessage);

export default router;