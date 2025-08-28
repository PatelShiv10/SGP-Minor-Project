const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, getLawyerConversations } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/conversation', protect, getConversation);
router.post('/message', protect, sendMessage);
router.get('/conversations', protect, getLawyerConversations);

module.exports = router;