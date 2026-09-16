// In-memory user storage for this session
// In production, this would be MongoDB
const users = new Map()
let userIdCounter = 1

export const createUser = (userData) => {
  const userId = `user-${userIdCounter++}`
  const user = {
    id: userId,
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password,
    googleId: userData.googleId || null,
    wishlist: [],
    cart: [],
    createdAt: new Date()
  }
  users.set(userId, user)
  return user
}

export const findUserByEmail = (email) => {
  for (const user of users.values()) {
    if (user.email === email.toLowerCase()) {
      return user
    }
  }
  return null
}

export const findUserById = (userId) => {
  return users.get(userId)
}

export const updateUser = (userId, updates) => {
  const user = users.get(userId)
  if (user) {
    Object.assign(user, updates)
    users.set(userId, user)
    return user
  }
  return null
}

export const addToWishlist = (userId, product) => {
  const user = users.get(userId)
  if (user) {
    if (!user.wishlist.some((item) => item.id === product.id)) {
      user.wishlist.push(product)
    }
    users.set(userId, user)
    return user.wishlist
  }
  return null
}

export const removeFromWishlist = (userId, productId) => {
  const user = users.get(userId)
  if (user) {
    user.wishlist = user.wishlist.filter((item) => item.id !== productId)
    users.set(userId, user)
    return user.wishlist
  }
  return null
}

export const getWishlist = (userId) => {
  const user = users.get(userId)
  return user ? user.wishlist : null
}
