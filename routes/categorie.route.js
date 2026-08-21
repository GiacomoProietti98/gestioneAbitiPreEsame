const express = require('express');
const router = express.Router();

const categorieController = require('../controllers/categorie.controller');

router.get('/', categorieController.getCategorie);
router.post('/', categorieController.createCategoria);
router.delete('/:id', categorieController.deleteCategoria);

module.exports = router;
