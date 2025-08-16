const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/appointmentController');

router.post('/', auth, c.create); 
router.get('/me', auth, c.mine);   

module.exports = router;
