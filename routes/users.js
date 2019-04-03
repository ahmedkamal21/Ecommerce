const mongoose = require("mongoose");
const User = mongoose.model("Users");
const { Product } = require("../models/Products");
const { auth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const passport = require("passport");
const SALT_INT = 10;

const { sendEmail } = require("../mail");

module.exports = app => {
  // Remove items from cart
  app.get("/auth/users/remove_cart", auth, (req, res) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { cart: { id: mongoose.Types.ObjectId(req.query.id) } } },
      { new: true },
      (err, doc) => {
        let cart = doc.cart;
        let array = cart.map(item => {
          return mongoose.Types.ObjectId(item.id);
        });
        Product.find({ _id: { $in: array } })
          .populate("brands")
          .populate("woods")
          .exec((err, cartDetail) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
              cartDetail,
              cart
            });
          });
      }
    );
  });

  // Adding products to user cart
  app.post("/auth/users/add_cart", auth, (req, res) => {
    console.log("Received " + req.query.productId);
    User.findOne({ _id: req.user._id }, (err, user) => {
      let duplicate = false;
      user.cart.forEach((item, i) => {
        if (item.id == req.query.productId) {
          console.log("Matches " + item.id);
          duplicate = true;
        }
      });
      if (duplicate) {
        User.findOneAndUpdate(
          {
            _id: req.user._id,
            "cart.id": mongoose.Types.ObjectId(req.query.productId)
          },
          { $inc: { "cart.$.quantity": 1 } },
          { new: true },
          (err, doc) => {
            if (err) {
              return res.json({
                success: false,
                err
              });
            }
            return res.status(200).send(doc.cart);
          }
        );
      } else {
        User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: {
              cart: {
                id: mongoose.Types.ObjectId(req.query.productId),
                quantity: 1,
                date: Date.now()
              }
            }
          },
          { new: true },
          (err, doc) => {
            console.log(doc);
            if (err) return res.send(400).json({ success: false, err });
            return res.status(200).json(doc.cart);
          }
        );
      }
    });
  });

  // Protecting Routes
  app.get("/auth/users", auth, (req, res) => {
    console.log(req.user);
    res.status(200).json({
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      cart: req.user.cart,
      history: req.user.history,
      role: req.user.role
    });
  });

  // Register users
  const registerUser = (newUser, callback) => {
    bcrypt.genSalt(SALT_INT, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(callback);
      });
    });
  };

  app.post("/auth/register", (req, res) => {
    console.log(req.body);
    req.checkBody("first_name", "First name is required").notEmpty();
    req.checkBody("last_name", "Last name is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    if (req.body.email) {
      req.checkBody("email", "Email is not valid").isEmail();
    }
    req.checkBody("password", "Password is required").notEmpty();
    req
      .checkBody("password", "Password must contain a number")
      .matches("[0-9]");
    req
      .checkBody("password", "Password must be at least 5 characters")
      .isLength({ min: 5 });
    req
      .checkBody("confirm_password", "Passwords do not match")
      .equals(req.body.password);

    let errors = req.validationErrors();
    if (errors) {
      console.log(errors);
      return res.send({ error: errors });
    }
    User.find({ email: req.body.email }, (err, email) => {
      console.log(email);
      if (email.length > 0) {
        return res.send({ error: { email: "Email already exists" } });
      }
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        name: `${req.body.first_name} ${req.body.last_name}`
      });
      registerUser(user, (err, user) => {
        console.log(user);
        if (err) {
          console.log(err);
        }
        sendEmail(user.email, user.first_name, null, "welcome");
      });

      res.send({ success: "Successfully registered" });
    });
  });
  app.post("/auth/signin", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(info);
      }
      req.login(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.send({ success: "Successfully loggedin" });
      });
    })(req, res, next);
  });
  app.get("/auth/current_user", (req, res) => {
    console.log(`here is the actual request object user ${req.user}`);
    if (req.user) {
      res.json(req.user);
    }
  });
  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.status(200).json({
      logout: true
    });
  });
  app.post("/auth/edit", auth, (req, res) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: req.body },
      { new: true },
      (err, doc) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({
          success: true
        });
      }
    );
  });
};
