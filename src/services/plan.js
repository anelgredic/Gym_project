const db = require("../database/models/index");

class Plan {
  constructor(db) {
    this.db = db;
  }

  async createPlan(planName, monthlyLimit, price) {
    const newPlan = await this.db.Plan.create({
      planName,
      monthlyLimit,
      price,
    });

    return newPlan;
  }

  async updatePlan(updateBody, planId) {
    const updateKeys = Object.keys(updateBody);
    const allowedUpdates = ["planName", "monthlyLimit", "price"];
    const isValidOperation = updateKeys.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      const error = new Error("Invalid updates!");
      error.status = 400;
      throw error;
    }

    const plan = await this.db.Plan.findByPk(planId);

    if (!plan) {
      const error = new Error("Plan not found!");
      error.status = 404;
      throw error;
    }
    try {
      updateKeys.forEach((update) => (plan[update] = updateBody[update]));
      await plan.save();
      return plan;
    } catch (e) {
      const error = e.message;
      error.status = 400;
      throw error;
    }
  }

  async deletePlan(id) {
    const plan = await this.db.Plan.destroy({ where: { id } });
    if (!plan) {
      const error = new Error("Plan not found!");
      error.status = 404;
      throw error;
    }
  }

  async getPlans() {
    const plans = this.db.Plan.findAll();
    return plans;
  }

  async getPlanById(id) {
    const plan = this.db.Plan.findByPk(id);

    if (!plan) {
      const error = new Error("Plan not found!");
      error.status = 404;
      throw error;
    }
    return plan;
  }
}

module.exports = new Plan(db);
