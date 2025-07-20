import { Router } from 'express';
import { CartManager } from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity || 1);
    res.json({ status: 'success', message: 'Producto agregado al carrito', payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const productsArray = req.body.products;
    if (!Array.isArray(productsArray)) {
      return res.status(400).json({ status: 'error', message: 'products debe ser un array' });
    }
    const updatedCart = await cartManager.updateCartProducts(cid, productsArray);
    res.json({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
    }
    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    res.json({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    await cartManager.removeProductFromCart(cid, pid);
    res.json({ status: 'success', message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    await cartManager.clearCart(cid);
    res.json({ status: 'success', message: 'Carrito limpiado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
