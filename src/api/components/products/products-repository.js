const { Product } = require('../../../models');

async function getProducts({ page_number, page_size, sort, search }) {
  let query = Product.find({});

  const total_count = await Product.countDocuments(query);
  const total_pages = Math.ceil(total_count / page_size);
  const skip = (page_number - 1) * page_size;
  const products = await query.skip(skip).limit(page_size);

  return {
    page_number: parseInt(page_number) || 1,
    page_size: parseInt(page_size) || total_count,
    count: total_count,
    total_pages: total_pages,
    has_previous_page: page_number > 1,
    has_next_page: skip + products.length < total_count,
    data: products,
  };
}

async function getProduct(id) {
  return Product.findById(id);
}

async function createProduct(name, price) {
  return Product.create({
    name,
    price,
  });
}

async function updateProduct(id, name, price) {
  return Product.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        price,
      },
    }
  );
}

async function deleteProduct(id) {
  return Product.deleteOne({ _id: id });
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
