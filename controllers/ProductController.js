import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import asyncHandler from 'express-async-handler';

//@desc create new product
//@route POST /api/v1/products
//@access Private/Admin
export const createProductCtrl = asyncHandler(async(req,res)=>{
  // const convertedImgs = req.files.map((file)=> file.path);
    const{name, description, category, price, totalQty,brand,} = req.body;
    
    // find the category
const categoryFound = await Category.findOne({
    name: category,
});
if(!categoryFound){
    throw new Error(
        "Category not found, please create category first or check category name"
    );
}

//Product exists
const productExists = await Product.findOne({name});
if(productExists){
    throw new Error("Product already exists");
}
// find the brand
const brandFound = await Brand.findOne({
name: brand?.toLowerCase(),
});
if(!brandFound){
throw new Error(
    "Brand not found, please create brand first or check brand name"
);
}

    //create the product
    const product = await Product.create({
        name, 
        description, 
        category, 
        user: req.userAuthId,
        price, 
        totalQty,
        brand,
      //  images: convertedImgs,
    });
    //push the product into category
    categoryFound.products.push(product._id)

    //resave

    await categoryFound.save();

    //push the product into brand
    brandFound.products.push(product._id)

    //resave

    await brandFound.save();

    //send response
    res.json({
        status: "success",
        message: "Product saved successfully",
        product, 
    })

});

//@desc Get all products
//@route Get/ api/v1/products
//@access Public

export const getProductsCtrl = asyncHandler(async(req, res)=>{
    //console.log(req.query);
    //query
    let productQuery = Product.find();
    
    
    //search by name
    if(req.query.name){
        productQuery = productQuery.find({
            name:{$regex: req.query.name, $options:'i'},
        })
    }

    //filter by brand
    if(req.query.brand){
        productQuery = productQuery.find({
            brand:{$regex: req.query.brand, $options:'i'},
        })
    }
    //filter by category
    if(req.query.category){
        productQuery = productQuery.find({
            category:{$regex: req.query.category, $options:'i'},
        })
    }
    //filterr by price range
    if(req.query.price){
        const priceRange = req.query.price.split('-');
        //gte: greater or equal
        //lte: lesser or equal
        productQuery = productQuery.find({
            price:{$gte: priceRange[0], $lte: priceRange[1]}
        });
    }

    //pagination
    //page
    const page = parseInt(req.query.page) ? parseInt(req.query.page):1;

    //limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit):10;
    //startIndex
    const startIndex = (page -1)*limit;
    //endIndex
    const endIndex = page*limit;
    //total
    const total = await Product.countDocuments();

    productQuery = productQuery.skip(startIndex).limit(limit);

    //pagination result
    const pagination ={};

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit,
        };
    }
    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    //await the query
    const products = await productQuery.populate('reviews');

    res.json({
        status: "Success",
        total,
        results: products.length,
        pagination,
        message: "Products fetched successfully",
        products,
    });
});

//@desc Get single product
//@route GET /api/v1/products/:id
//@access Public

export const getProductCtrl = asyncHandler(async(req,res)=>{
    const product = await Product.findById(req.params.id).populate('reviews');
    if(!product){
        throw new Error('Product not found')
    }
    res.json({
        status: 'success',
        message: 'Product fetched successfully',
        product,
    })
});

//@desc update product
//@route PUT /api/products/:id/update
//@access Private/Admin

export const updateProductCtrl = asyncHandler(async(req,res)=>{
  
    const{name, description, category, user, price, totalQty,brand,} = req.body;

    //update
    const product = await Product.findByIdAndUpdate(req.params.id, {
        name, description, category, user, price, totalQty,brand,
    },{
        new: true,
    })
    res.json({
        status: 'success',
        message: 'Product updated successfully',
        product,
    })
});

//@desc delete product
//@route DELETE /api/products/:id/delete
//@access Private/Admin

export const deleteProductCtrl = asyncHandler(async(req,res)=>{
   await Product.findByIdAndDelete(req.params.id);
    res.json({
        status: 'success',
        message: 'Product deleted successfully',
    })
});