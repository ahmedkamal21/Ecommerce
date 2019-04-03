let admin = (req, res, next) => {
  console.log(req.user);
  if (req.user.role === 0) {
    return res.json({
      success: false,
      message: "You are not authorised"
    });
  }
  next();
};

module.exports = { admin };
