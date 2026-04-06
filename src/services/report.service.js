const { Transaction, Category, sequelize } = require("../models");
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

      // 1. Total ingresos
      const totalIncomeResult = await Transaction.sum("amount", {
        where: {
          type: "ingreso",
          date: {
            [Op.between]: [startStr, endStr],
          },
        },
      });
      const totalIncome = totalIncomeResult || 0;

      // 2. Total egresos
      const totalExpenseResult = await Transaction.sum("amount", {
        where: {
          type: "egreso",
          date: {
            [Op.between]: [startStr, endStr],
          },
        },
      });
      const totalExpense = totalExpenseResult || 0;

      // 3. Egresos agrupados por categoria
      const expensesByCategoryRaw = await Transaction.findAll({
        attributes: [
          "categoryId",
          [sequelize.fn("SUM", sequelize.col("amount")), "total"],
        ],
        where: {
          type: "egreso",
          date: {
            [Op.between]: [startStr, endStr],
          },
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
          expensesByCategory,
        },
      };
    } catch (error) {
      throw new Error(`Error generando reporte mensual: ${error.message}`);
    }
  }
}

module.exports = new ReportService();
