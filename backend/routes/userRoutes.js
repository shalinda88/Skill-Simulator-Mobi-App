const  express = require('express');
const {login,registerAdult,registerStudent,getTeacherStudents,getParentChildren,fingerprintLogin,faceLogin,updateUser,universalBiometricLogin} = require('../controllers/userController');


const router = express.Router();

router.put('/:id',updateUser);
router.post('/register-adult',registerAdult);
router.post('/register-student',registerStudent);
router.post('/universal-biometric-login',universalBiometricLogin);

router.get('/teacher-students/:teacherId', getTeacherStudents);
router.get('/parent-children/:parentId', getParentChildren);

router.post('/finger-login',fingerprintLogin);
router.post('/face-login',faceLogin);
router.post('/login',login);

module.exports = router;


