# Run server #

#> server-mr-sol > npm run dev

### Config ###

* port 7000
* localhost
* origin: "http://localhost:7000"

#### Config db ####

 const config = {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'dbmr'
}

### install 
npm install crypto --save

#### Lanzar en producción ####
 pm2 start npm -- run start

//debe esta instalado npm install -g @babel/core @babel/cli global

// luego renombrar a
pm2 restart id --name serverMR-Sol7000

## data run por liena de comando 
$env:OPENSSL_CONF = $null

## BUILD PROD
--npm run build