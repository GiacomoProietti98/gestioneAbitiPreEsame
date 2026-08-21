const express = require('express');
const router = express.Router();

const capiRoute = require('./capi.route');
const categorieRoute = require('./categorie.route');

router.use('/capi', capiRoute);
router.use('/categorie', categorieRoute);

module.exports = router;
