require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.Port || 3000;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./helpers/swaggerConfig');

app.use(require('./helpers/mongo'));
app.use(cookieParser());
app.use(
    session({
        secret: 'Neto',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.json());
app.use('/install', require('./Script/script'));
app.use('/hall', require('./control/HallAPI'));
app.use('/user', require('./control/UserAPI'));
app.use('/buffet', require('./control/BuffetAPI'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Startando Api');
});
