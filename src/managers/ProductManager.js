import { ProductModel } from '../models/Product.model.js';
import mongoosePaginate from 'mongoose-paginate-v2';

ProductModel.schema.plugin(mongoosePaginate);

export class ProductManager {
  async createProduct(data) {
    const product = new ProductModel(data);
    return await product.save();
  }

  async getProducts({ limit = 10, page = 1, sort, query }) {
    const filter = {};
    if (query) {
      if (query === 'available') filter.status = true;
      else filter.category = query;
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: {},
      lean: true,
    };

    if (sort === 'asc') options.sort.price = 1;
    else if (sort === 'desc') options.sort.price = -1;

    const result = await ProductModel.paginate(filter, options);
    return result;
  }

  async getProductById(id) {
    return await ProductModel.findById(id).lean();
  }

  async deleteProduct(id) {
    return await ProductModel.findByIdAndDelete(id);
  }

  async updateProduct(id, data) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }
}
