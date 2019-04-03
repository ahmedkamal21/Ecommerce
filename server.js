const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const expressValidator = require("express-validator");

// Set-up monogoose
require("dotenv").config();
mongoose.connect(process.env.DATABASE).then(connection => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: "abcdefg",
    resave: true,
    saveUninitialized: false
  })
);

// Express Messages
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  res.locals.user = req.user || null;
  next();
});

app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      const namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Models
require("./models/Users");

require("./services/passport");

// Routes
require("./routes/users.js")(app);
require("./routes/brands.js")(app);
require("./routes/woods.js")(app);
require("./routes/products.js")(app);

// Listen to server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
