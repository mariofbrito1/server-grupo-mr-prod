const express = require('express');
//const nodemailer = require('nodemailer');
const cors = require("cors");
const multer = require('multer');
const path = require('path'); 

const { pool } = require('./dbHelper');

const app = express();

// Configuración para Railway
const PORT = process.env.PORT || 7000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// CORRECCIÓN: CORS para producción
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ["https://*.railway.app", "https://*.up.railway.app", "*"] 
        : "*",
    credentials: true
};

app.use(cors(corsOptions));

// CORRECCIÓN: Servir archivos estáticos con path absoluto
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configuración de Multer - CORREGIDA para producción
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // CORRECCIÓN: Usar path absoluto
        cb(null, path.join(__dirname, 'images'));
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: fileStorage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

app.use(upload.single('imagen'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORRECCIÓN: Verificación de conexión a BD mejorada
async function initializeDatabase() {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Conectado a PostgreSQL correctamente');
    } catch (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        // No salir del proceso, permitir que el servidor inicie igual
    }
}

initializeDatabase(); 
 
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Maria del Rosario - Sol Bus API',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({ 
        message: '🚌 Maria del Rosario - Sol Bus API',
        environment: process.env.NODE_ENV,
        status: 'running',
        port: PORT
    });
});

// =============================================
// RUTAS ORGANIZADAS POR MÓDULOS
// =============================================

// CORRECCIÓN: Todas las rutas con require corregidas
try {
    // 1. USUARIOS - CLIENTES - PERSONAL
    app.use(require('./routes/usuario.routes'));  
    app.use(require('./routes/roles.routes'));  
    app.use(require('./routes/categoria_usuario.routes'));
    app.use(require('./routes/usuario_rol.routes'));
    app.use(require('./routes/usuario_sucursal.routes'));
    app.use(require('./routes/usuario_unidad.routes'));

    // 2. LOCALIZACIÓN ENTIDADES FÍSICAS
    app.use(require('./routes/centro.routes'));
    app.use(require('./routes/sucursal.routes'));  
    app.use(require('./routes/sector.routes'));   

    // 3. UNIDADES FÍSICAS - VEHÍCULOS
    app.use(require('./routes/estado_vehiculo.routes'));
    app.use(require('./routes/tipo_carroceria.routes'));
    app.use(require('./routes/tipo_unidad.routes'));
    app.use(require('./routes/unidad_vehiculo.routes'));
    app.use(require('./routes/unidad_plan.routes'));

    // 4. PRODUCTOS E INVENTARIO 
    app.use(require('./routes/repuesto.routes'));  

    // 5. ESTADOS GENERALES 
    app.use(require('./routes/estado_neumatico.routes'));
    app.use(require('./routes/estado_repuesto.routes'));
    app.use(require('./routes/estado_tanque.routes'));
    app.use(require('./routes/estado_movimiento_repuesto.routes'));

    // 6. PROVEEDORES Y EQUIPOS EXTERNOS
    app.use(require('./routes/proveedor.routes')); 
    app.use(require('./routes/gps.routes')); 
    app.use(require('./routes/expendedora_boletos.routes')); 
    app.use(require('./routes/camara.routes')); 
    app.use(require('./routes/poliza.routes'));

    // 7. NEUMÁTICOS
    app.use(require('./routes/modelo_neumatico.routes'));
    app.use(require('./routes/neumatico.routes'));

    // 8. PLANES Y DOCUMENTACIÓN
    app.use(require('./routes/plan.routes'));
    app.use(require('./routes/carnet.routes'));
    app.use(require('./routes/usuario_carnet.routes'));
    app.use(require('./routes/tipo_carnet.routes'));
    app.use(require('./routes/categoria.routes'));
    app.use(require('./routes/tipo_plan.routes'));  
    app.use(require('./routes/tarea_plan.routes')); 

    // 9. TANQUES Y COMBUSTIBLE
    app.use(require('./routes/tanque.routes')); 

    // 10. DOCUMENTACIÓN Y CERTIFICACIONES
    app.use(require('./routes/rto.routes'));  

    // 11. TIPOS Y CATALOGOS
    app.use(require('./routes/tipo_combustible.routes')); 
    app.use(require('./routes/tipo_proveedor.routes')); 
    app.use(require('./routes/tipo_rto.routes')); 
    app.use(require('./routes/tipo_tanque.routes')); 

    // 12. TAREAS Y ACTIVIDADES
    app.use(require('./routes/tarea.routes')); 

    // 13. TURNOS Y HORARIOS
    app.use(require('./routes/turno.routes'));

    console.log('✅ Todas las rutas cargadas correctamente');
} catch (error) {
    console.error('❌ Error cargando rutas:', error.message);
}

// CORRECCIÓN: Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// CORRECCIÓN: Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// CORRECCIÓN: Iniciar servidor
app.listen(PORT, HOST, () => {
    console.log('🚀 Maria del Rosario - Sol Bus Server iniciado');
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`🌍 Host: ${HOST}`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 URL: http://${HOST}:${PORT}`);
});