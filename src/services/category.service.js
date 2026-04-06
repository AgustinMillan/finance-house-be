const { Category } = require('../models');

class CategoryService {
    async getCategories() {
        try {
            const categories = await Category.findAll({ order: [['name', 'ASC']] });
            return {
                success: true,
                data: categories,
                count: categories.length,
            };
        } catch (error) {
            throw new Error(`Error obteniendo categorias: ${error.message}`);
        }
    }

    async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id);
            return {
                success: true,
                data: category,
            };
        } catch (error) {
            throw new Error(`Error obteniendo categoria: ${error.message}`);
        }
    }

    async createCategory(category) {
        try {
            const newCategory = await Category.create(category);
            return {
                success: true,
                data: newCategory,
            };
        } catch (error) {
            throw new Error(`Error creando moto de motor: ${error.message}`);
        }
    }

    async updateCategory(id, category) {
        try {
            const updatedCategory = await Category.update(category, { where: { id } });
            return {
                success: true,
                data: updatedCategory,
            };
        } catch (error) {
            throw new Error(`Error actualizando categoria: ${error.message}`);
        }
    }
}

module.exports = new CategoryService();