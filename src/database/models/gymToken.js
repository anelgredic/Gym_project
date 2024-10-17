"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GymToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GymToken.belongsTo(models.Gym, {
        foreignKey: "gymId",
        as: "gym",
        onDelete: "CASCADE",
      });
    }
  }
  GymToken.init(
    {
      token: DataTypes.STRING,
      gymId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "GymToken",
    }
  );
  return GymToken;
};
