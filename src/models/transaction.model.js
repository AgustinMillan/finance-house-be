const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("ingreso", "egreso"),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isTransfer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Transaction;
