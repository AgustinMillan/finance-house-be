const { Transaction, Category, Account, sequelize } = require("../models");
const { Op } = require("sequelize");

class ReportService {
  async getMonthlyReport(year, month) {
    try {
      // Crear fechas de inicio y fin del mes
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Último día del mes pedido

      // Formato YYYY-MM-DD
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];

      const dateRange = { [Op.between]: [startStr, endStr] };

      // 1. Total ingresos (excluyendo transferencias internas)
      const totalIncomeResult = await Transaction.sum("amount", {
        where: {
          type: "ingreso",
          isTransfer: false,
          date: dateRange,
        },
      });
      const totalIncome = totalIncomeResult || 0;

      // 2. Total egresos (excluyendo transferencias internas)
      const totalExpenseResult = await Transaction.sum("amount", {
        where: {
          type: "egreso",
          isTransfer: false,
          date: dateRange,
        },
      });
      const totalExpense = totalExpenseResult || 0;

      // 3. Ahorros netos del mes:
      //    = dinero que ENTRÓ a la cuenta "Ahorros" (ingresos isTransfer)
      //    − dinero que SALIÓ de la cuenta "Ahorros" (egresos isTransfer)
      let totalSavings = 0;
      const ahorrosAccount = await Account.findOne({ where: { name: "Ahorros" } });
      if (ahorrosAccount) {
        const savingsInResult = await Transaction.sum("amount", {
          where: {
            type: "ingreso",
            isTransfer: true,
            accountId: ahorrosAccount.id,
            date: dateRange,
          },
        });
        const savingsOutResult = await Transaction.sum("amount", {
          where: {
            type: "egreso",
            isTransfer: true,
            accountId: ahorrosAccount.id,
            date: dateRange,
          },
        });
        totalSavings = (savingsInResult || 0) - (savingsOutResult || 0);
      }

      // 4. Egresos agrupados por categoria (excluyendo transferencias)
      const expensesByCategoryRaw = await Transaction.findAll({
        attributes: [
          "categoryId",
          [sequelize.fn("SUM", sequelize.col("amount")), "total"],
        ],
        where: {
          type: "egreso",
          isTransfer: false,
          date: dateRange,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["name"],
          },
        ],
        group: ["Transaction.categoryId", "category.id"],
      });

      const expensesByCategory = expensesByCategoryRaw.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.category ? item.category.name : "Sin categoría",
        total: Number(item.get("total")) || 0,
      }));

      return {
        success: true,
        data: {
          totalIncome,
          totalExpense,
          totalSavings,
          expensesByCategory,
        },
      };
    } catch (error) {
      throw new Error(`Error generando reporte mensual: ${error.message}`);
    }
  }
}

module.exports = new ReportService();
