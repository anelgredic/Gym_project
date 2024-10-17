const express = require("express");
const gymService = require("../services/gym");
const userService = require("../services/user");
const authGym = require("../middleware/authGym");
const authUser = require("../middleware/authUser");
const isAdmin = require("../middleware/isAdmin");

// const userService = require("../services/user");

const router = new express.Router();

router.post("/gyms", async (req, res) => {
  const { gymName, email, password, address } = req.body;

  try {
    // Kreiranje korisnika
    const newUser = await gymService.createUser(
      gymName,
      email,
      password,
      address
    );

    const token = await gymService.generateAuthToken(newUser);

    res.status(201).json({ newUser, token });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.post("/gyms/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await gymService.getGymByEmail(email);
    await gymService.checkPassword(password, user.password);
    const token = await gymService.generateAuthToken(user);

    res.send({ user, token });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.post("/gyms/logout", authGym, async (req, res) => {
  try {
    // Briši token koji je poslan
    await gymService.logout(req.token);
    res.send({ message: "Logged out successfully." });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/gyms/logoutAll", authGym, async (req, res) => {
  try {
    // Briši sve tokene za korisnika
    await gymService.logoutFromAllDevices(req.gym.id);
    res.send({ message: "Logged out from all devices!" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/gyms/me", authGym, async (req, res) => {
  res.send(req.gym);
});

router.patch("/gyms/me", authGym, async (req, res) => {
  try {
    const gym = await gymService.updateGym(req.body, req.gym);

    res.send(gym);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.delete("/gyms/me", authGym, async (req, res) => {
  const id = req.gym.id;
  try {
    await gymService.deleteGym(id);
    res.status(200).send({ message: "User deleted successfully." });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// Scan qr code and get user

router.get("/gyms/scan/user", authGym, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userService.getUserById(userId);
    const userPlan = await userService.getUserPlan(userId);
    // Check if user has plan and workouts left
    await userService.checkUserPlan(userPlan);

    res.status(200).send({
      userId,
      name: user.name,
      surname: user.surname,
      numberOfWorkouts: userPlan.workoutsLeft,
    });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

router.patch("/gyms/record/workout", authGym, async (req, res) => {
  try {
    const { userId } = req.body;
    const gym = req.gym.id;
    const gymId = gym.id;

    const recordWorkout = await gymService.recordWorkout(gymId, userId);
    const workoutsLeft = await userService.decreaseUserLeftWorkouts(userId);

    res.status(200).send({ message: "Workout registered successfully!" });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// Admin routes

// Show all gym users
router.get("/gyms", authUser, isAdmin, async (req, res) => {
  try {
    const gyms = await gymService.getAllGyms();

    res.send(gyms);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

// Show gym user
router.get("/gyms/:id", authUser, isAdmin, async (req, res) => {
  const _id = req.params.id;
  try {
    const gym = await gymService.getGymById(_id);
    res.send(gym);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

module.exports = router;
