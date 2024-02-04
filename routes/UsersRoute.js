import  express from 'express';
import { loginUserCntrl, registerUserCtrl, getUserProfileCtrl, updateShippingAddresctrl } from '../controllers/UserController.js';
import { isLoggedIn } from "../middlewares/isLoggedin.js";

const userRoutes = express.Router();

userRoutes.post('/register',registerUserCtrl);
userRoutes.post('/login',loginUserCntrl);
userRoutes.get('/profile',isLoggedIn, getUserProfileCtrl);
userRoutes.put('/update/shipping',isLoggedIn, updateShippingAddresctrl);


export default userRoutes;