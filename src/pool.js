const { Pool } = require('pg');
const config = require('./config'); 

// Pool global compartido para toda la aplicación
const pool = new Pool({
  ...config,
  max: 100,                         // Máximo de conexiones
  idleTimeoutMillis: 30000,        // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 5000,   // Timeout para obtener conexión
});

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;



