const { User } = require("../models/Users");

let auth = (req, res, next) => {
  if (!req.user) {
    return res.json({ isAuth: false, message: "Unauthorised access" });
  }
  next();
};

module.exports = { auth };
