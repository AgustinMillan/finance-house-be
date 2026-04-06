const traccarClient = require("../external/traccarClient");
const { MotorBike } = require("../models");
const DAGPSClient = require("./dagps.service");

/**
 * Mutex simple para limitar concurrencia de navegadores Playwright
 */
class BrowserMutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }

  async lock() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve();
    } else {
      this.locked = false;
    }
  }
}

/**
 * Servicio para interactuar con Traccar
 * Contiene la lógica de negocio relacionada con GPS y dispositivos
 */
class TraccarService {
  constructor() {
    this.daGpsClients = new Map();
    this.activeRequests = new Map();
    this.browserMutex = new BrowserMutex(); // Cola de espera para navegadores
  }

  async getPositions(motorBikeId) {
    // 🔒 Si ya hay una request activa, devolver esa misma
    if (this.activeRequests.has(motorBikeId)) {
      return this.activeRequests.get(motorBikeId);
    }

    const requestPromise = (async () => {
      try {
        const motorBike = await MotorBike.findByPk(motorBikeId);
        if (!motorBike) {
          throw new Error("Moto no encontrada");
        }

        let positions;

        if (motorBike.gpsType !== "TRACCAR") {
          let daGpsClient = this.daGpsClients.get(motorBikeId);

          if (!daGpsClient) {
            daGpsClient = await this.getdaGpsClient(motorBike.trackingToken);
            this.daGpsClients.set(motorBikeId, daGpsClient);
          }

          const res = await daGpsClient.getOnlineGpsInfo({
            userId: daGpsClient.userId,
            schoolId: daGpsClient.userId,
          });

          if (res.reconect) {
            this.daGpsClients.delete(motorBikeId);
            throw new Error("Requiere reconexión");
          }

          positions = res;
        } else {
          positions = await traccarClient.getPositions(motorBike.trackingToken);
        }

        return {
          success: true,
          data: positions,
          count: positions?.length || 0,
        };
      } catch (error) {
        // Si falla, limpiamos cliente
        this.daGpsClients.delete(motorBikeId);

        throw error;
      } finally {
        // 🔓 Siempre liberar el lock
        this.activeRequests.delete(motorBikeId);
      }
    })();

    // Guardamos la promise activa
    this.activeRequests.set(motorBikeId, requestPromise);

    return requestPromise;
  }

  async getPositionByTraccar(trackingToken) {
    return await traccarClient.getPositions(trackingToken);
  }

  async getdaGpsClient(trackingToken) {
    await this.browserMutex.lock(); // BLOQUEA LA COLA (1 navegador a la vez)
    const daGpsClient = new DAGPSClient(trackingToken, "123456");

    try {
      await daGpsClient.init();
    } catch (error) {
      console.error(`[RAM-Protect] Error en Playwright (DAGPS): ${error.message}`);
      throw error; // Retornamos el error al frontend, pero la cola avanza
    } finally {
      // 🛡️ GARANTIZAR que el proceso de Google Chrome se destruya liberando 200MB de RAM.
      try {
        await daGpsClient.close();
      } catch (closeErr) {
        console.error(`[RAM-Protect] Fallo forzando el cierre del navegador: ${closeErr.message}`);
      }
      this.browserMutex.unlock(); // LIBERA LA COLA PARA LA SIGUIENTE MOTO
    }

    return daGpsClient;
  }
}

module.exports = new TraccarService();
