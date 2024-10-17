const db = require("../database/models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class Gym {
  constructor(db) {
    this.db = db;
  }

  async createUser(gymName, email, password, address) {
    const usedEmail = await this.db.Gym.findOne({ where: { email } });

    if (usedEmail) {
      const error = new Error("This email is already in use!");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = await this.db.Gym.create({
      gymName,
      email,
      password: hashedPassword,
      address,
    });

    return newUser;
  }

  async generateAuthToken(gym) {
    // Generiši JWT token
    const token = jwt.sign({ id: gym.id }, process.env.JWT_SECRET);

    // Sačuvaj token u GymToken modelu
    await this.db.GymToken.create({ token, gymId: gym.id });

    return token;
  }

  async checkPassword(inputPassword, userPassword) {
    if (!(await bcrypt.compare(inputPassword, userPassword))) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
  }

  async getGymByEmail(email) {
    const gym = await this.db.Gym.findOne({ where: { email } });
    if (!gym) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
    return gym;
  }

  async logout(token) {
    await this.db.GymToken.destroy({ where: { token } });
  }

  async logoutFromAllDevices(gymId) {
    try {
      await this.db.GymToken.destroy({ where: { gymId } });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateGym(updateBody, gym) {
    const updateKeys = Object.keys(updateBody);
    const allowedUpdates = ["gymName", "email", "password", "address"];
    const isValidOperation = updateKeys.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      const error = new Error("Invalid updates!");
      error.status = 400;
      throw error;
    }

    if (!gym) {
      const error = new Error("User not found!");
      error.status = 404;
      throw error;
    }
    try {
      updateKeys.forEach((update) => (gym[update] = updateBody[update]));
      await gym.save();
      return gym;
    } catch (e) {
      const error = e.message;
      error.status = 400;
      throw error;
    }
  }

  async deleteGym(id) {
    try {
      await this.db.GymToken.destroy({
        where: { gymId: id },
      });
      await this.db.Gym.destroy({ where: { id } });
    } catch (e) {
      throw new Error("Error deleting user!");
    }
  }

  async getAllGyms() {
    const gyms = await this.db.Gym.findAll();
    return gyms;
  }

  async getGymById(gymId) {
    const gym = await this.db.Gym.findByPk(gymId);
    if (!gym) {
    }
    return gym;
  }

  async recordWorkout(gymId, userId) {
    const workout = await this.db.Workout.create({
      gymId,
      userId,
      checkInTime: new Date(),
    });

    return workout;
  }
}

module.exports = new Gym(db);
