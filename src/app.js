import express from 'express';
import cookieParser from 'cookie-parser';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { connectDB } from './config/db.js';
import { Server } from 'socket.io';
import http from 'http';
import { ProductManager } from './managers/ProductManager.js';

import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

connectDB();

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use('/', viewsRouter);

const productManager = new ProductManager();

io.on('connection', socket => {
  console.log('🟢 Cliente conectado via WebSocket');

  socket.on('newProduct', async (productData) => {
    try {
      await productManager.createProduct(productData);
      const products = await productManager.getProducts({ limit: 100 });
      io.emit('updateProducts', products.docs);
    } catch (error) {
      console.error('❌ Error creando producto:', error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      const products = await productManager.getProducts({ limit: 100 });
      io.emit('updateProducts', products.docs);
    } catch (error) {
      console.error('❌ Error eliminando producto:', error.message);
    }
  });
});

server.listen(8080, () => {
  console.log('🚀 Servidor escuchando en puerto 8080');
});
