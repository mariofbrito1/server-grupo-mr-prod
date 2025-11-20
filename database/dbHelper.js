const pool = require('./pool');

/* asegura la gestion de las conecciones */
const withConnection = async (callback) => {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release(); // SIEMPRE liberar la conexión
  }
};

module.exports = {
  pool,
  withConnection
};