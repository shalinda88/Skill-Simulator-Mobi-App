const express = require('express');
const authMiddleware = require('../middleware/authMiddlware');
const progressController = require('../controllers/progressController');

const router = express.Router();

// Apply middleware to all progress routes
router.use(authMiddleware);

// Routes that now require authentication
router.get('/', progressController.getFullProgress);
router.get('/:studentId',progressController.getStudentProgress);
router.get('/module-progress/:moduleType', progressController.getSkillModuleProgress);
router.get('/game-progress/:gameType', progressController.getSkillGameProgress);
router.put('/module-progress/:moduleType', progressController.updateSkillModuleProgress);
router.put('/game-progress/:gameType', progressController.updateSkillGameProgress);
router.get('/all-game-progress', progressController.getAllGameProgress);
router.get('/all-module-progress', progressController.getAllModuleProgress);

module.exports = router;