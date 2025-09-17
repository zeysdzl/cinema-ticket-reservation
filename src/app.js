const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors(
    //Fill it with secure domains
));

app.use(express.json());


// serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// swagger
const swaggerPath = path.join(__dirname, 'docs', 'swagger.json');
const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// api
app.use('/api', apiRouter);

// global error handler
app.use(errorHandler);

module.exports = app;
