const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = mongoose.model("Users");

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialization
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    console.log(user, id);
    done(null, user);
  });
});

// Local Strategy
const comparePassword = (userPass, hash, callback) => {
  bcrypt.compare(userPass, hash, (err, isMatch) => {
    if (err) {
      console.log(err);
    }
    callback(null, isMatch);
  });
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (username, password, done) => {
      User.findOne({ email: username }).then(user => {
        if (!user) {
          return done(null, false, { message: "User does not exist" });
        }
        comparePassword(password, user.password, (err, isMatch) => {
          if (err) console.log(err);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password is incorrect" });
          }
        });
      });
    }
  )
);
