import express from 'express'
import { getAllProducts, getProductById, getProductCategories } from '../controllers/productController.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/categories', getProductCategories)
router.get('/:id', getProductById)

export default router
