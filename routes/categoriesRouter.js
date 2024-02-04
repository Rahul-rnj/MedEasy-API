import  express from 'express';
import { createCategoryCtrl, deleteCategoryCtrl, getAllCategoryCtrl, getSingleCategoryCtrl, updateCategoryCtrl } from '../controllers/categories.js';
import { isLoggedIn } from '../middlewares/isLoggedin.js';

const categoriesRouter = express.Router();
categoriesRouter.post('/', isLoggedIn,createCategoryCtrl);
categoriesRouter.get('/',getAllCategoryCtrl);
categoriesRouter.get('/:id',getSingleCategoryCtrl);
categoriesRouter.delete('/:id',deleteCategoryCtrl);
categoriesRouter.put('/:id', updateCategoryCtrl);

export default categoriesRouter

