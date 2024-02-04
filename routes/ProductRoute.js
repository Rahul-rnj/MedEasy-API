import  express from 'express';
import { createProductCtrl, deleteProductCtrl, getProductCtrl, getProductsCtrl, updateProductCtrl } from '../controllers/ProductController.js';
import { isLoggedIn } from '../middlewares/isLoggedin.js';
import upload from '../config/fileUpload.js';
import isAdmin from '../middlewares/isAdmin.js';

const productsRouter = express.Router();

productsRouter.post('/',isLoggedIn, isAdmin,upload.array('files') ,createProductCtrl);
productsRouter.get('/', getProductsCtrl);
productsRouter.get('/:id', getProductCtrl);
productsRouter.put('/:id',isLoggedIn ,updateProductCtrl);
productsRouter.delete('/:id/delete',isLoggedIn ,deleteProductCtrl);


export default productsRouter;