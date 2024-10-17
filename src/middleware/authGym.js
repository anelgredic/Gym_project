const jwt = require("jsonwebtoken");
const db = require("../database/models/index");
const Gym = db.Gym;
const GymToken = db.GymToken;

const authGym = async (req, res, next) => {
  try {
    // Provera da li postoji Authorization header
    if (!req.header("Authorization")) {
      throw new Error();
    }

    // Dohvati token iz headera
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verifikuj token i dohvati podatke enkodovane u JWT-u
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pronađi token u GymToken tabeli
    const gymToken = await GymToken.findOne({ where: { token } });
    if (!gymToken) {
      throw new Error();
    }

    // Pronađi gym korisnika na osnovu gymId iz GymToken-a
    const gym = await Gym.findOne({ where: { id: gymToken.gymId } });
    if (!gym) {
      throw new Error();
    }

    // Proslijedi gym korisnika i token za sledeći middleware
    req.token = token;
    req.gym = gym;
    next();
  } catch (e) {
    // Prijavi grešku
    res.status(401).send({ error: e.message || "Please authenticate." });
  }
};

module.exports = authGym;
