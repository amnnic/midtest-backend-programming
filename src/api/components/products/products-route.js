const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const productsControllers = require('./products-controller');
const productsValidator = require('./products-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/products', route);

  route.get('/', productsControllers.getProducts);

  route.post(
    '/',

    celebrate(productsValidator.createProduct),
    productsControllers.createProduct
  );

  route.get('/:id', productsControllers.getProduct);

  route.put(
    '/:id',

    celebrate(productsValidator.updateProduct),
    productsControllers.updateProduct
  );

  route.delete(
    '/:id',

    productsControllers.deleteProduct
  );
};
