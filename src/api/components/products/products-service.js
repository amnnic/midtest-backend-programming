const productsRepository = require('./products-repository');

async function getProducts({ page_number, page_size, sort, search }) {
  const products = await productsRepository.getProducts({
    page_number,
    page_size,
    sort,
    search,
  });

  return products;
}

async function getProduct(id) {
  const product = await productsRepository.getProduct(id);

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    price: product.price,
  };
}

async function createProduct(name, price) {
  try {
    return await productsRepository.createProduct(name, price);
  } catch (err) {
    return null;
  }
}

async function updateProduct(id, name, price) {
  const product = await productsRepository.getProduct(id);

  if (!product) {
    return null;
  }

  try {
    await productsRepository.updateProduct(id, name, price);
  } catch (err) {
    return null;
  }

  return true;
}

async function deleteProduct(id) {
  const product = await productsRepository.getProduct(id);

  if (!product) {
    return null;
  }

  try {
    await productsRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
