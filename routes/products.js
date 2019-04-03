const { Product } = require("../models/Products");
const { auth } = require("../middlewares/auth");
const { admin } = require("../middlewares/admin");
const mongoose = require("mongoose");

module.exports = app => {
  app.post("/api/product/productDetail", (req, res) => {
    const product = new Product(req.body);

    product.save((err, brand) => {
      if (err) {
        return res.json({
          success: false,
          err
        });
      }
      return res.status(200).json({
        success: true
      });
    });
  });

  // Get products by id
  app.get("/api/product/products_by_id", (req, res) => {
    let type = req.query.type;
    let products = req.query.id;

    if (type === "array") {
      let ids = req.query.id.split(",");
      products = [];
      products = ids.map(product => {
        return mongoose.Types.ObjectId(product);
      });
    }
    Product.find({ _id: { $in: products } })
      .populate("brand")
      .populate("wood")
      .exec((err, products) => {
        return res.status(200).send(products);
      });
  });

  // Get products by popularity (how many sold)
  app.get("/api/product/products_by_sort", (req, res) => {
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let order = req.query.order ? req.query.order : "asc";
    let limit = req.query.limit ? parseInt(req.query.limit) : 100;

    Product.find()
      .sort([[sortBy, order]])
      .limit(limit)
      .populate("brand")
      .populate("wood")
      .exec((err, products) => {
        if (err) return res.json({ success: false, err });
        console.log(products);
        return res.status(200).send(products);
      });
  });

  // Filter products
  app.post("/api/product/shop", (req, res) => {
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let order = req.body.order ? req.body.order : "asc";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let filtersArg = {};
    console.log(req.body);

    const filters = req.body.filters;
    for (let key in filters) {
      if (filters[key].length > 0) {
        if (key === "price") {
          filtersArg[key] = {
            $gte: filters[key][0],
            $lte: filters[key][1]
          };
        } else {
          filtersArg[key] = filters[key];
        }
      }
    }

    Product.find(filtersArg)
      .sort([[sortBy, order]])
      .populate("brand")
      .populate("wood")
      .limit(limit)
      .skip(skip)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({
          products,
          sizeResult: products.length
        });
      });
  });
};
