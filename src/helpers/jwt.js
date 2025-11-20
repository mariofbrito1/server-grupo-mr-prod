const jwt = require('jsonwebtoken');

const generarJWT = (uid, name) => {

    return new Promise((resolve, reject) => {

        const payload = { uid, name };

        jwt.sign(payload, 'marfrig-Esto-Es-UnA-PalbR@_SecretA12341267', {
            expiresIn: '24h'
        }, (err, token) => {

            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }

            resolve(token);

        })


    })
}



module.exports = {
    generarJWT
}


