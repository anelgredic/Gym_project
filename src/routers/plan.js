const express = require("express");
const planService = require("../services/plan");
const auth = require("../middleware/authUser");
const isAdmin = require("../middleware/isAdmin");

const router = new express.Router();

// Create plan - Admin only
router.post("/plans", auth, isAdmin, async (req, res) => {
  const { planName, monthlyLimit, price } = req.body;

  try {
    const newPlan = await planService.createPlan(planName, monthlyLimit, price);

    res.status(201).json({ newPlan });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update plan - Admin only
router.patch("/plans/:id", auth, isAdmin, async (req, res) => {
  try {
    const updatedPlan = await planService.updatePlan(req.body, req.params.id);

    res.send(updatedPlan);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// Delete plan - Admin only
router.delete("/plans/:id", auth, isAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    await planService.deletePlan(id);
    res.status(200).send({ message: "Plan deleted successfully." });
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

// Get plans
router.get("/plans", auth, async (req, res) => {
  try {
    const plans = await planService.getPlans();
    res.status(200).send(plans);
  } catch (e) {
    res.status(500).send();
  }
});

// Get plan
router.get("/plans/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const plan = await planService.getPlanById(id);
    res.send(plan);
  } catch (e) {
    res
      .status(e.status || 500)
      .send({ error: e.message || "Internal Server Error" });
  }
});

module.exports = router;
