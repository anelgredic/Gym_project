const express = require("express");
const userService = require("../services/user");
const planService = require("../services/plan");
const authUser = require("../middleware/authUser");
const isAdmin = require("../middleware/isAdmin");
const plan = require("../services/plan");

const router = new express.Router();

// Create user
router.post("/users", async (req, res) => {
  const { name, surname, email, password, phoneNumber } = req.body;

  try {
    // Kreiranje korisnika
    const newUser = await userService.createUser(
      name,
      surname,
      email,
      password,
      phoneNumber
    );

    const token = await userService.generateAuthToken(newUser);
    const userWithQR = await userService.assignQRCodeToUser(newUser.id);

    res.status(201).json({ userWithQR, token });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);
    await userService.checkPassword(password, user.password);
    const token = await userService.generateAuthToken(user);

    res.send({ user, token });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.post("/users/logout", authUser, async (req, res) => {
  try {
    // Briši token koji je poslan
    await userService.logout(req.token);
    res.send({ message: "Logged out successfully." });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/logoutAll", authUser, async (req, res) => {
  try {
    // Briši sve tokene za korisnika
    await userService.logoutFromAllDevices(req.user.id);
    res.send({ message: "Logged out from all devices!" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/users/me", authUser, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", authUser, async (req, res) => {
  try {
    const user = await userService.updateUser(req.body, req.user);

    res.send(user);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.delete("/users/me", authUser, async (req, res) => {
  const id = req.user.id;
  try {
    await userService.deleteUser(id);
    res.status(200).send({ message: "User deleted successfully." });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// User - User Plan

router.post("/users/me/addPlan", authUser, async (req, res) => {
  try {
    const { planId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Obrisi prethnodnu userPlan vezu
    await userService.deleteUserPlans(userId, planId);

    // Kreiraj vezu između korisnika i plana u UserPlans tabeli
    const userPlan = await userService.addPlanToUser(
      userId,
      planId,
      startDate,
      endDate
    );

    res.status(201).send({ message: "Plan added to user!", userPlan });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// Get plan

router.get("/users/me/plan", authUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const currentPlan = await userService.getUserPlan(userId);

    res.send(currentPlan);
  } catch (e) {
    res.status(500).send();
  }
});
// Admin-only routes

// Show all users
router.get("/users", authUser, isAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.send(users);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

// Show user
router.get("/users/:id", authUser, isAdmin, async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await userService.getUserById(_id);
    res.send(user);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

module.exports = router;
