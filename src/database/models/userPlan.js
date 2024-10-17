"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPlan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserPlan.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      UserPlan.belongsTo(models.Plan, {
        foreignKey: "planId",
        as: "plan",
      });
    }
  }
  UserPlan.init(
    {
      userId: DataTypes.INTEGER,
      planId: DataTypes.INTEGER,
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      workoutsLeft: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserPlan",
    }
  );
  return UserPlan;
};
