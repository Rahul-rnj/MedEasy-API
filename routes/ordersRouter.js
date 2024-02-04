import express from 'express'
import { createOrderCtrl, getAllordersCtrl, getOrderStatsCtrl, getSingleOrderCtrl, updateOrderCtrl } from '../controllers/orderCtrl.js';
import { isLoggedIn } from '../middlewares/isLoggedin.js';

const orderRouter = express.Router();

orderRouter.post('/', isLoggedIn,createOrderCtrl);
orderRouter.get("/",isLoggedIn,getAllordersCtrl);
orderRouter.get("/:id",isLoggedIn,getSingleOrderCtrl);
orderRouter.put("/update/:id",isLoggedIn,updateOrderCtrl);
orderRouter.get("/sales/stat",isLoggedIn,getOrderStatsCtrl);




export default orderRouter;