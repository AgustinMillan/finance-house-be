const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Si hay una URL de conexión completa, usarla
// De lo contrario, construir la conexión desde las variables de entorno
let sequelize;

if (process.env.DATABASE_URL) {
    // Usar URL completa de conexión (útil para Supabase, Heroku, etc.)
    // Detectar si necesita SSL basándose en la URL (Supabase siempre requiere SSL)
    const needsSSL = process.env.DATABASE_URL.includes('supabase') ||
        process.env.DATABASE_URL.includes('pooler') ||
        process.env.DB_SSL === 'true';

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: needsSSL ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        } : {},
        sync: { force: true }
    });
} else {
    // Construir conexión desde variables individuales
    sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            logging: dbConfig.logging,
            pool: dbConfig.pool,
            dialectOptions: dbConfig.dialectOptions || {},
        }
    );
}

/**
 * Prueba la conexión a la base de datos
 */
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        return true;
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error.message);
        return false;
    }
}

/**
 * Sincroniza los modelos con la base de datos
 * @param {boolean} force - Si es true, elimina y recrea las tablas
 */
async function syncDatabase(force = false) {
    try {
        await sequelize.sync({ force });
        console.log('✅ Base de datos sincronizada correctamente.');
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando la base de datos:', error.message);
        return false;
    }
}

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
};

