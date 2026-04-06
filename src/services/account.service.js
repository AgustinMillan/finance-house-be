const { Account } = require("../models");

class AccountService {
  async createAccount(account) {
    try {
      const newAccount = await Account.create(account);
      return {
        success: true,
        data: newAccount,
      };
    } catch (error) {
      throw new Error(`Error creando cuenta: ${error.message}`);
    }
  }

  async getAccountById(id) {
    try {
      const account = await Account.findByPk(id);
      if (!account) {
        throw new Error("Cuenta no encontrada");
      }
      return account;
    } catch (error) {
      throw new Error(`Error obteniendo cuenta: ${error.message}`);
    }
  }

  async getAccounts() {
    try {
      const accounts = await Account.findAll({ where: { isActive: true } });

      return {
        success: true,
        data: accounts,
        count: accounts.length,
      };
    } catch (error) {
      throw new Error(`Error obteniendo cuentas: ${error.message}`);
    }
  }

  async updateAccount(id, account) {
    try {
      const updatedAccount = await Account.update(account, { where: { id } });
      return {
        success: true,
        data: updatedAccount,
      };
    } catch (error) {
      throw new Error(`Error actualizando cuenta: ${error.message}`);
    }
  }
}

module.exports = new AccountService();
