"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Workout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Workout.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Workout.belongsTo(models.Gym, {
        foreignKey: "gymId",
        as: "gym",
      });
    }
  }
  Workout.init(
    {
      userId: DataTypes.INTEGER,
      gymId: DataTypes.INTEGER,
      checkInTime: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Workout",
    }
  );
  return Workout;
};
