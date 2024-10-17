const { Model } = require("sequelize");
const db = require("../database/models/index");
const Plan = db.Plan;
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");
const planService = require("../services/plan");

class User {
  constructor(db) {
    this.db = db;
  }

  async createUser(name, surname, email, password, phoneNumber) {
    const usedEmail = await this.db.User.findOne({ where: { email } });

    if (usedEmail) {
      const error = new Error("This email is already in use!");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = await this.db.User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return newUser;
  }

  async assignQRCodeToUser(userId) {
    const user = await this.db.User.findByPk(userId);

    const qrData = `${user.id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    user.qrCode = qrCode;
    await user.save();
    return user;
  }

  async generateAuthToken(user) {
    // Generiši JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Sačuvaj token u UserToken modelu
    await this.db.UserToken.create({ token, userId: user.id });

    return token;
  }

  async checkPassword(inputPassword, userPassword) {
    if (!(await bcrypt.compare(inputPassword, userPassword))) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
  }

  async getUserByEmail(email) {
    const user = await this.db.User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
    return user;
  }

  async getAllUsers() {
    const users = await this.db.User.findAll({
      attributes: { exclude: ["qrCode"] }, // Isključujemo qrCode polje
      include: [
        { model: this.db.UserPlan, as: "userPlans" },
        { model: this.db.Workout, as: "workouts" },
      ],
    });
    return users;
  }

  async getUserById(userId) {
    const user = await this.db.User.findByPk(userId, {
      attributes: { exclude: ["qrCode"] }, // Isključujemo qrCode polje
      include: [
        { model: this.db.UserPlan, as: "userPlans" },
        { model: this.db.Workout, as: "workouts" },
      ],
    });
    if (!user) {
    }
    return user;
  }

  async logout(token) {
    await this.db.UserToken.destroy({ where: { token } });
  }

  async logoutFromAllDevices(userId) {
    try {
      await this.db.UserToken.destroy({ where: { userId } });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateUser(updateBody, user) {
    const updateKeys = Object.keys(updateBody);
    const allowedUpdates = [
      "name",
      "surname",
      "email",
      "password",
      "phoneNumber",
    ];
    const isValidOperation = updateKeys.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      const error = new Error("Invalid updates!");
      error.status = 400;
      throw error;
    }

    if (!user) {
      const error = new Error("User not found!");
      error.status = 404;
      throw error;
    }
    try {
      updateKeys.forEach((update) => (user[update] = updateBody[update]));
      await user.save();
      return user;
    } catch (e) {
      const error = "Error with updating user";
      error.status = 400;
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await this.db.UserToken.destroy({
        where: { userId: id },
      });
      await this.db.User.destroy({ where: { id } });
    } catch (e) {
      const error = new Error("Error deleting user!");
      error.status = 400;
      throw error;
    }
  }

  async addPlanToUser(userId, planId, startDate, endDate) {
    // Check if there is a plan with planId
    const plan = await Plan.findByPk(planId);

    if (!plan) {
      const error = new Error("Product not found!");
      error.status = 404;
      throw error;
    }

    const { monthlyLimit } = plan;

    try {
      const userPlan = await this.db.UserPlan.create({
        userId,
        planId,
        startDate,
        endDate,
        workoutsLeft: monthlyLimit,
      });
      return userPlan;
    } catch (e) {
      const error = new Error("Error adding plan to user.");
      error.status = 400;
      throw error;
    }
  }

  async deleteUserPlans(userId) {
    try {
      await this.db.UserPlan.destroy({ where: { userId } });
    } catch (e) {
      const error = new Error("Error deleting User's plan.");
      error.status = 400;
      throw error;
    }
  }

  async getUserPlan(userId) {
    const plan = await this.db.UserPlan.findOne({
      where: { userId },
      include: [{ model: this.db.Plan, as: "plan" }],
    });

    return plan;
  }
  async checkUserPlan(userPlan) {
    if (!userPlan) {
      const error = new Error("The user has no plan.");
      error.status = 400;
      throw error;
    } else if (userPlan.workoutsLeft <= 0) {
      const error = new Error("The user has no workouts left!");
      error.status = 400;
      throw error;
    }
  }

  async decreaseUserLeftWorkouts(userId) {
    const userPlan = await this.db.UserPlan.findOne({ where: { userId } });

    userPlan.workoutsLeft -= 1;
    await userPlan.save();

    return userPlan.workoutsLeft;
  }

  async getUserById(userId) {
    const user = await this.db.User.findByPk(userId, {
      attributes: { exclude: ["qrCode"] }, // Isključujemo qrCode polje
      include: [
        { model: this.db.UserPlan, as: "userPlans" },
        { model: this.db.Workout, as: "workouts" },
      ],
    });
    if (!user) {
      const error = new Error("User not found!");
      error.status = 404;
      throw error;
    }
    console.log(user);
    return user;
  }

  async getAllUsers() {
    const users = await this.db.User.findAll({
      attributes: { exclude: ["qrCode"] }, // Isključujemo qrCode polje
      include: [
        { model: this.db.UserPlan, as: "userPlans" },
        { model: this.db.Workout, as: "workouts" },
      ],
    });
    return users;
  }
}
module.exports = new User(db);
