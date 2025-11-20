const express = require('express');
const nodemailer = require('nodemailer');
const cors = require("cors");
const multer = require('multer');

const { pool } = require('./database/dbHelper');

const app = express();
/*
app.post("/send-email", (req, res) => {

console.log("enviando mail");

  /* var transporter = nodemailer.createTransport({
       host: "smtp.ethereal.email",
       port: 587,
       secure: false,
       
       auth: {
            user: "aaron77@ethereal.email" ,
            pass: "5TxeMVw4pC6quKAkyR",
       }
   });*/
/*
   var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        
        auth: {
            user: "mariofbrito@gmail.com" ,
            pass: "oeijyvxcfyyxwzio",
        }
    });


    //esto debe venir por el res
    var mailOptions = {
        from: "Remitente",
        to: "mariofbrito@gmail.com",
        subject: "ENviado desde nodemailer",
        text: "HOla mundo "
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log("Error", error.message);

            res.status(500).send(error.message)
        } else {
            console.log("message send oka");
            res.status(200).jsonp(req.body);
        }
    });
});
*/

const corsOptions = {
    origin: "*:*"
};

// Servimos el contenido de la carpeta 'images' estaticamente
app.use(express.static('images'));

// Configuracion de Multer


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        // Acepta la imagen porque tiene extension .png, .jpg o .jpeg
        cb(null, true);
    } else {
        // Rechaza la imagen
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

//module.exports = upload


app.use(cors());

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Conectado a PostgreSQL correctamente');
  }
});

// midleware
app.use(express.urlencoded({ extended: true })); //extended para no recibir ninguna imagen
app.use(express.json());


//  USUARIOS - CLIENTES - PERSONAL//
// =============================================
// RUTAS ORGANIZADAS POR MÓDULOS
// =============================================

// 1. USUARIOS - CLIENTES - PERSONAL
app.use(require('./routes/usuario.routes'));  
app.use(require('./routes/roles.routes'));  
app.use(require('./routes/categoria_usuario.routes'));
app.use(require('./routes/usuario_rol.routes')); // NUEVA
app.use(require('./routes/usuario_sucursal.routes')); // NUEVA
app.use(require('./routes/usuario_unidad.routes')); // NUEVA


// 2. LOCALIZACIÓN ENTIDADES FÍSICAS
app.use(require('./routes/centro.routes'));
app.use(require('./routes/sucursal.routes'));  
app.use(require('./routes/sector.routes'));   


// 3. UNIDADES FÍSICAS - VEHÍCULOS
app.use(require('./routes/estado_vehiculo.routes'));
app.use(require('./routes/tipo_carroceria.routes'));
app.use(require('./routes/tipo_unidad.routes'));
app.use(require('./routes/unidad_vehiculo.routes')); // NUEVA
app.use(require('./routes/unidad_plan.routes')); // NUEVA


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
app.use(require('./routes/camara.routes.js')); 
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
app.use(require('./routes/tipo_carroceria.routes')); 
app.use(require('./routes/tipo_combustible.routes')); 
app.use(require('./routes/tipo_proveedor.routes')); 
app.use(require('./routes/tipo_rto.routes')); 
app.use(require('./routes/tipo_tanque.routes')); 
app.use(require('./routes/tipo_unidad.routes')); 

// 12. TAREAS Y ACTIVIDADES
app.use(require('./routes/tarea.routes')); 

// 13. TURNOS Y HORARIOS
app.use(require('./routes/turno.routes'));  



app.listen(7000);
console.log('Maria del Roasario - Sol Bus Server Init --> port 7000');
