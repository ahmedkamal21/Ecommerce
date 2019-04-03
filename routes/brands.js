const { Brand } = require("../models/Brands");
const { auth } = require("../middlewares/auth");
const { admin } = require("../middlewares/admin");

module.exports = app => {
  app.post("/api/product/brands", auth, admin, (req, res) => {
    const brands = new Brand(req.body);

    brands.save((err, brand) => {
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

  // Get all Brands
  app.get("/api/product/brands", (req, res) => {
    Brand.find({}, (err, brands) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, brandData: brands });
    });
  });
};
