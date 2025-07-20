import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import { CartManager } from '../managers/CartManager.js';

const productManager = new ProductManager();
const cartManager = new CartManager();
const router = Router();


router.use(async (req, res, next) => {
  if (!req.cookies.cartId) {
    const newCart = await cartManager.createCart();
    res.cookie('cartId', newCart._id.toString(), { httpOnly: true });
    req.cartId = newCart._id.toString();
  } else {
    req.cartId = req.cookies.cartId;
  }
  next();
});

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/products', async (req, res) => {
  try {
    const result = await productManager.getProducts(req.query);
    res.render('home', {
      title: 'Catálogo de Productos',
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.prevLink,
      nextLink: result.nextLink,
    });
  } catch (err) {
    console.error('Error al cargar productos paginados:', err.message);
    res.status(500).send('Error interno del servidor');
  }
});


router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getProducts({ limit: 100 });
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      products: result.docs,
    });
  } catch (err) {
    console.error('Error al cargar productos realtime:', err.message);
    res.status(500).send('Error interno del servidor');
  }
});


router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }

    res.render('productDetail', {
      product,
      cartId: req.cartId 
    });
  } catch (err) {
    console.error('Error al cargar producto:', err.message);
    res.status(500).send('Error interno del servidor');
  }
});


router.get('/cart', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.cartId); 
    if (!cart) {
      return res.status(404).render('error', { message: 'Carrito no encontrado' });
    }

    const productsWithTotals = cart.products.map(p => ({
      title: p.product.title,
      price: p.product.price,
      quantity: p.quantity,
      total: p.product.price * p.quantity
    }));

    const totalCart = productsWithTotals.reduce((acc, p) => acc + p.total, 0);

    res.render('cart', {
      title: 'Mi Carrito',
      products: productsWithTotals,
      totalCart
    });
  } catch (err) {
    console.error('Error al cargar el carrito:', err.message);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
