"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Gym extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Gym.hasMany(models.GymToken, {
        foreignKey: "gymId",
        as: "tokens",
      });

      Gym.hasMany(models.Workout, {
        foreignKey: "gymId",
        as: "workouts",
      });
    }
  }
  Gym.init(
    {
      gymName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Gym",
    }
  );
  return Gym;
};
