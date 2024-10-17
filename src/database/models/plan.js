"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Plan.hasMany(models.UserPlan, {
        foreignKey: "planId",
        as: "userPlans",
      });
    }
  }
  Plan.init(
    {
      planName: DataTypes.STRING,
      monthlyLimit: DataTypes.INTEGER,
      price: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Plan",
    }
  );
  return Plan;
};
