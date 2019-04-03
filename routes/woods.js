const { Wood } = require("../models/Woods");
const { auth } = require("../middlewares/auth");
const { admin } = require("../middlewares/admin");

module.exports = app => {
  app.post("/api/product/wood", auth, admin, (req, res) => {
    const wood = new Wood(req.body);

    wood.save((err, wood) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true
      });
    });
  });

  app.get("/api/product/woods", (req, res) => {
    Wood.find({}, (err, woods) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({
        success: true,
        woodData: woods
      });
    });
  });
};
