import categoryModel from '../model/category.model.js';
import productModel from '../model/product.model.js';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

// only access by admin only to create new category
const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryTitle, categoryDescription } = req.body;
    if (!categoryName || !categoryTitle || !categoryDescription ) {
      return res.status(400).json({ message: 'Fill the data properly' });
    }

    const existingCategory = await categoryModel.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const stream = cloudinary.v2.uploader.upload_stream((err, cloudinaryResult) => {
      if (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }

      const newCategory = new categoryModel({
        categoryName,
        categoryTitle,
        categoryDescription,
        imageURL: cloudinaryResult.secure_url,
        imagePublicId: cloudinaryResult.public_id,
        originalName: req.file.originalname
      });

      newCategory.save()
        .then(savedCategory => {
          res.status(201).json({ category: savedCategory });
        })
        .catch(error => {
          console.error('Error saving category to database:', error);
          res.status(500).json({ message: 'Internal server error' });
        });
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// only access by admin to get all category
const getAllCategory = async (req, res) => {
    try {
      const categories = await categoryModel.find();
      res.status(200).json({ categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    };
};

// only access by admin to get one category
const getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
      const category = await categoryModel.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }  
      res.status(200).json({ data : category });
    } catch (error) {
      if(error.name==="CastError") return res.status(404).json({ message: "Category not found" });
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await categoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    };

    if (existingCategory.originalName === req.file.originalname) {            
      const updatedCategoryData = { ...req.body };
      updatedCategoryData.imageURL = existingCategory.imageURL;
      updatedCategoryData.imagePublicId = existingCategory.imagePublicId;
      updatedCategoryData.originalName = existingCategory.originalName;

      const updatedCategory = await productModel.findByIdAndUpdate(id, updatedCategoryData, { new: true });
      return res.json({ message: 'Product updated successfully no image change', data: updatedCategory });
    } else {
      if (existingCategory.imagePublicId) {
          await cloudinary.uploader.destroy(existingCategory.imagePublicId);
      };

      const stream = cloudinary.v2.uploader.upload_stream((err, cloudinaryResult) => {
          if (err) {
              console.error('Cloudinary upload error:', err);
              return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
          }
      
          const updatedCtegoryData = {
              ...req.body,
              imageURL: cloudinaryResult.secure_url,
              imagePublicId: cloudinaryResult.public_id,
              originalName: req.file.originalname
          };
      
          productModel.findByIdAndUpdate(id, updatedCtegoryData, { new: true })
              .then(updatedCategory => {
                  res.json({ message: 'Product updated successfully image change', data: updatedCategory });
              })
              .catch(error => {
                  console.error('Error updating product by ID:', error);
                  res.status(500).json({ message: 'Internal server error' });
              });
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    }
  } catch (error) {
    if(error.name==="CastError") return res.status(404).json({ message: "Category not found" });
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// only access by admin to delete a category
const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findOneAndDelete({ _id: id });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await cloudinary.uploader.destroy(deletedCategory.imagePublicId);
    await productModel.deleteMany({ categoryId: id });
    res.status(204).json({ message: 'Category and associated products deleted' });
  } catch (error) {
    if(error.name==="CastError") return res.status(404).json({ message: "Category not found" });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  };
};

export {createCategory, getAllCategory,getCategoryById, updateCategoryById, deleteCategoryById}