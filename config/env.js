/**
 * Configuración centralizada de variables de entorno
 */

module.exports = {
    // === SERVIDOR ===
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // === BASE DE DATOS ===
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT || 5432,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_SSL: process.env.DB_SSL === 'true',
    DB_LOGGING: process.env.DB_LOGGING === 'true',

    // === TRACCAR GPS ===
    TRACCAR_BASE_URL: process.env.TRACCAR_BASE_URL || 'http://localhost:8082',
    TRACCAR_USERNAME: process.env.TRACCAR_USERNAME,
    TRACCAR_PASSWORD: process.env.TRACCAR_PASSWORD,

    // === DEBUG ===
    DEBUG: process.env.DEBUG === 'true',
};

