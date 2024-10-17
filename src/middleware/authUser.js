const jwt = require("jsonwebtoken");
const db = require("../database/models/index");
const User = db.User;
const UserToken = db.UserToken;

const authUser = async (req, res, next) => {
  try {
    // Provera da li postoji Authorization header
    if (!req.header("Authorization")) {
      throw new Error();
    }

    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pronađi korisnika na osnovu tokena u UserToken tabeli
    const userToken = await UserToken.findOne({ where: { token } });

    if (!userToken) {
      throw new Error();
    }

    // Pronađi korisnika na osnovu userId
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = authUser;
