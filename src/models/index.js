const { sequelize } = require("../database/connection");

const Category = require("./category.model");
const Account = require("./account.model");
const Transaction = require("./transaction.model");

// Asociaciones

Category.hasMany(Transaction, {
  foreignKey: "categoryId",
  as: "transactions",
});

Transaction.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Account.hasMany(Transaction, {
  foreignKey: "accountId",
  as: "transactions",
});

Transaction.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// ⚠️ En producción: usar migraciones, no sync
sequelize.sync({ alter: true });

module.exports = {
  sequelize,
  Account,
  Transaction,
  Category,
};
