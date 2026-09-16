import { getProduct, products } from '../data/products.js'

export const getAllProducts = (req, res) => {
  const { category, sort } = req.query

  let result = [...products]

  if (category && category !== 'All') {
    result = result.filter((product) => product.category === category)
  }

  if (sort === 'Price: low to high') {
    result.sort((a, b) => a.price - b.price)
  } else if (sort === 'Price: high to low') {
    result.sort((a, b) => b.price - a.price)
  }

  res.status(200).json({ success: true, data: result })
}

export const getProductById = (req, res) => {
  const { id } = req.params
  const product = getProduct(id)

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  res.status(200).json({ success: true, data: product })
}

export const getProductCategories = (req, res) => {
  const categories = ['All', ...new Set(products.map((p) => p.category))]
  res.status(200).json({ success: true, data: categories })
}
