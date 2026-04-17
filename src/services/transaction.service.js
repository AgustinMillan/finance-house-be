const { Transaction, Account, sequelize } = require("../models");
const { Op } = require("sequelize");

class TransactionService {
  async createTransaction(transactionData) {
    const t = await sequelize.transaction();
    try {
      const amount = Number(transactionData.amount);

      const newTransaction = await Transaction.create(transactionData, {
        transaction: t,
      });

      if (newTransaction.type === "ingreso") {
        await Account.increment("balance", {
          by: amount,
          where: { id: newTransaction.accountId },
          transaction: t,
        });
      } else {
        await Account.decrement("balance", {
          by: amount,
          where: { id: newTransaction.accountId },
          transaction: t,
        });
      }

      await t.commit();

      return {
        success: true,
        data: newTransaction,
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Error creando transacción: ${error.message}`);
    }
  }

  async getTransactions({
    categoryId,
    accountId,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  }) {
    try {
      const whereClause = {};
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }
      if (accountId) {
        whereClause.accountId = accountId;
      }
      if (type) {
        whereClause.type = type;
      }
      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate,
        };
      }

      const transactions = await Transaction.findAll({
        where: whereClause,
        offset: (page - 1) * limit,
        limit,
        order: [["createdAt", "DESC"]],
      });
      return {
        success: true,
        data: transactions,
        count: await Transaction.count({ where: whereClause }),
      };
    } catch (error) {
      throw new Error(`Error obteniendo transacciones: ${error.message}`);
    }
  }

  async getTransactionById(id) {
    try {
      const transaction = await Transaction.findByPk(id);
      if (!transaction) {
        throw new Error("Transacción no encontrada");
      }
      return {
        success: true,
        data: transaction,
      };
    } catch (error) {
      throw new Error(`Error obteniendo transacción: ${error.message}`);
    }
  }
  async updateTransaction(id, transactionData) {
    const t = await sequelize.transaction();
    try {
      const existingTransaction = await Transaction.findByPk(id, {
        transaction: t,
      });
      if (!existingTransaction) {
        throw new Error("Transacción no encontrada");
      }

      const oldAmount = Number(existingTransaction.amount);
      const newAmount = Number(
        transactionData.amount !== undefined
          ? transactionData.amount
          : existingTransaction.amount
      );

      const oldType = existingTransaction.type;
      const newType =
        transactionData.type !== undefined
          ? transactionData.type
          : existingTransaction.type;

      const oldAccountId = existingTransaction.accountId;
      const newAccountId =
        transactionData.accountId !== undefined
          ? transactionData.accountId
          : existingTransaction.accountId;

      // Revertir balance en cuenta antigua
      if (oldType === "ingreso") {
        await Account.decrement("balance", {
          by: oldAmount,
          where: { id: oldAccountId },
          transaction: t,
        });
      } else {
        await Account.increment("balance", {
          by: oldAmount,
          where: { id: oldAccountId },
          transaction: t,
        });
      }

      // Aplicar balance en cuenta nueva
      if (newType === "ingreso") {
        await Account.increment("balance", {
          by: newAmount,
          where: { id: newAccountId },
          transaction: t,
        });
      } else {
        await Account.decrement("balance", {
          by: newAmount,
          where: { id: newAccountId },
          transaction: t,
        });
      }

      await existingTransaction.update(transactionData, { transaction: t });

      await t.commit();

      return {
        success: true,
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Error actualizando transacción: ${error.message}`);
    }
  }

  async createTransfer({ fromAccountId, toAccountId, amount, date, description }) {
    const t = await sequelize.transaction();
    try {
      const parsedAmount = Number(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }
      if (fromAccountId === toAccountId) {
        throw new Error("La cuenta origen y destino no pueden ser la misma");
      }

      const today = date || new Date().toISOString().slice(0, 10);

      // Egreso en cuenta origen (dinero que sale)
      await Transaction.create(
        {
          accountId: fromAccountId,
          amount: parsedAmount,
          type: "egreso",
          date: today,
          description: description || "Transferencia a ahorros",
          isTransfer: true,
        },
        { transaction: t }
      );

      // Ingreso en cuenta destino (dinero que entra)
      await Transaction.create(
        {
          accountId: toAccountId,
          amount: parsedAmount,
          type: "ingreso",
          date: today,
          description: description || "Transferencia desde cuenta",
          isTransfer: true,
        },
        { transaction: t }
      );

      // Actualizar balances
      await Account.decrement("balance", {
        by: parsedAmount,
        where: { id: fromAccountId },
        transaction: t,
      });

      await Account.increment("balance", {
        by: parsedAmount,
        where: { id: toAccountId },
        transaction: t,
      });

      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();
      throw new Error(`Error creando transferencia: ${error.message}`);
    }
  }
}

module.exports = new TransactionService();
