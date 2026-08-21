const express = require('express');
const router = express.Router();

const capiController = require('../controllers/capi.controller');

router.get('/search', capiController.searchCapiByNome);
router.get('/disponibili', capiController.getCapiDisponibili);

router.get('/', capiController.getCapi);
router.post('/', capiController.createCapo);
router.get('/:id', capiController.getCapiById);
router.put('/:id', capiController.updateCapo);
router.delete('/:id', capiController.deleteCapo);

module.exports = router;
