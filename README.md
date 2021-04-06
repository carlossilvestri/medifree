# MediFree Backend

<h2>REST API con Autenticación por JWT. Hecha con Nodejs, Express, MySQL, JavaScript y el ORM Sequelize. Para el programa de medifree, Venezuela.</h2>

<h2>Para usar la API en localhost se necesita</h2>

<br/><br/>
<ul>
    <li>
        <ul>
            <li>Archivo variables.env con las siguientes variables en la raíz del proyecto (al mismo nivel de la carpeta api)</li>
            <h5>Una base de datos MySQL llamada medifree</h5>
            <li>DB_NAME=medifree</li>
            <li>DB_USER=root</li>
            <li>DB_PASS=</li>
            <li>DB_HOST=localhost</li>
            <li>BD_PORT=2017</li>
            <li>SEED_JSON_WEB_TOKEN=YOUR_SEED</li>
            <h4>Esta configuración de cloudinary es opcional</h4>
            <li>CLOUDINARY_CLOUD_NAME=REPLACE_FOR_YOUR_CLOUDINARY_CLOUD_NAME</li>
            <li>CLOUDINARY_API_KEY=REPLACE_FOR_YOUR_CLOUDINARY_API_KEY</li>
            <li>CLOUDINARY_API_SECRET=REPLACE_FOR_YOUR_CLOUDINARY_API_SECRET</li>
            <br/><br/>
        </ul>
    </li>
</ul>

<h4>Para correr el programa en modo de desarrollo</h4>
<p>npm run nodemon</p>
<h4>Para correr el programa en modo de producción</h4>
<p>npm run start</p>
