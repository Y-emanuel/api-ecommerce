import { CartModel } from '../models/Cart.model.js';

export class CartManager {
  async createCart() {
    const cart = new CartModel({ products: [] });
    return await cart.save();
  }

  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    return await cart.save();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = cart.products.find(p => p.product.toString() === productId);
    if (!product) throw new Error('Producto no encontrado en carrito');

    product.quantity = quantity;
    return await cart.save();
  }

  async updateCartProducts(cartId, productsArray) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = productsArray.map(p => ({
      product: p.productId,
      quantity: p.quantity,
    }));

    return await cart.save();
  }

  async clearCart(cartId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = [];
    return await cart.save();
  }
}
