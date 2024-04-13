import categoryModel from "../model/category.model.js";
import productModel from "../model/product.model.js";
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import ApiFeatures from "../utils/apiFeature.js";

// only access by admin to create product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryName, cookingTime } = req.body;
        if(!name || !description || !price || !stock || !categoryName || !cookingTime) return res.status(400).json({ message: 'Fill the data proper' });
        const existingProduct = await productModel.findOne({ name });
        if (existingProduct) {
          return res.status(400).json({ message: 'Product name already exists' });
        };
        const data = await categoryModel.findOne({categoryName : categoryName});
        if (!data) {
            return res.status(400).json({ message: 'Category not found' });
        };

        const stream =  cloudinary.v2.uploader.upload_stream((err, cloudinaryResult) => {
            if (err) {
              return res.status(500).json({ message: `Cloudinary upload error: ${err}` });
            }
      
            const newProduct = new productModel({
              name,
              description,
              price,
              stock,
              cookingTime,
              categoryName,
              categoryId : data._id,
              imageURL: cloudinaryResult.secure_url,
              imagePublicId: cloudinaryResult.public_id,
              originalName: req.file.originalname
            });
            newProduct.save()
              .then(savedProduct => {
                res.status(201).json({ message : "Product created Successfully", product: savedProduct });
              })
              .catch(error => {
                console.error('Error saving category to database:', error);
                res.status(500).json({ message: 'Internal server error' });
              });
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    };
};

const getAllProduct = async (req, res) => {
    try {
        const resultPerPage = 8;
        const productsCount = await productModel.countDocuments();
      
        const apiFeature = new ApiFeatures(productModel.find(), req.query)
          .search()
          .filter()
          .pagination(resultPerPage);
      
        let products = await apiFeature.query;
        let filteredProductsCount = products.length;
      
        res.status(200).json({
          success: true,
          products,
          productsCount,
          resultPerPage,
          filteredProductsCount,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// accessed by both admin and user
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ data : product });
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "Product not found" });
        console.error('Error fetching product by ID:');
        res.status(500).json({ message: error.message });
    };
};

// only access by admin to update product
const updateProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const existingProduct = await productModel.findById(id);

        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        };
        if (existingProduct.originalName === req.file.originalname) {            
            const updatedProductData = { ...req.body };
            updatedProductData.imageURL = existingProduct.imageURL;
            updatedProductData.imagePublicId = existingProduct.imagePublicId;
            updatedProductData.originalName = existingProduct.originalName;

            const updatedProduct = await productModel.findByIdAndUpdate(id, updatedProductData, { new: true });
            return res.json({ message: 'Product updated successfully no image change', data: updatedProduct });
        } else {
            if (existingProduct.imagePublicId) {
                await cloudinary.uploader.destroy(existingProduct.imagePublicId);
            };

            const stream = cloudinary.v2.uploader.upload_stream((err, cloudinaryResult) => {
                if (err) {
                    console.error('Cloudinary upload error:', err);
                    return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
                }
            
                const updatedProductData = {
                    ...req.body,
                    imageURL: cloudinaryResult.secure_url,
                    imagePublicId: cloudinaryResult.public_id,
                    originalName: req.file.originalname
                };
            
                productModel.findByIdAndUpdate(id, updatedProductData, { new: true })
                    .then(updatedProduct => {
                        res.json({ message: 'Product updated successfully image change', data: updatedProduct });
                    })
                    .catch(error => {
                        console.error('Error updating product by ID:', error);
                        res.status(500).json({ message: 'Internal server error' });
                    });
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        };
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "Product not found" });
        console.error('Error updating product by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    };
};

// only access by admin to delete product
const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        };
        const deleteEverything = await cloudinary.uploader.destroy(deletedProduct.imagePublicId);
        if(deleteEverything) res.status(204).json({ message: 'Product deleted successfully' });
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "Product not found" });
        console.error('Error deleting product by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export { createProduct, getAllProduct, getProductById, updateProductById, deleteProductById };
