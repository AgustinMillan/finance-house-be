// Cargar variables de entorno
require("dotenv").config();

const express = require("express");
const { testConnection } = require("./src/database/connection");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar controllers
const indexController = require("./src/controllers/index.controller");

// Rutas
app.use("/api", indexController);

// Ruta de health check
app.get("/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "OK",
    message: "Server is running",
    database: dbConnected ? "connected" : "disconnected",
  });
});

// Inicializar servidor
async function startServer() {
  // Probar conexión a la base de datos
  // await testConnection();

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("❌ Error iniciando el servidor:", error);
  process.exit(1);
});
