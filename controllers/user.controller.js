const users = require("../db/user.json");
var jwt = require("jsonwebtoken");

const login = (username, password) => {
  let user = users.find(
    (el) => el.username === username && el.password === password
  );

  if (!user) {
    return null;
  }

  var token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });

  return token;
};

module.exports = {
  login,
};