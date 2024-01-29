import express from 'express'
const router =express.Router();
import  userRegistration, { userLogin ,changeUserPassword,loggedUser ,sendUserPasswordResetEmail,userPasswordReset}  from '../controllers/userController.js'
import checkUserAuth from '../middlewares/auth-middleware.js';

//Route level middleware


//Public Routes
router.post('/register', userRegistration)
router.post('/login', userLogin)
router.post('/sendUserPasswordResetEmail', sendUserPasswordResetEmail)
router.post('/resetpassword/:id/:token', userPasswordReset)


// protected routes
router.post('/changepassword',checkUserAuth, changeUserPassword)
router.get('/loggeduser',checkUserAuth, loggedUser)

export default router