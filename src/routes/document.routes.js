
const express = require('express');

const {
    downloadDocument,
    deleteDocument
} = require('../controllers/document.controller');

const router = express.Router();

router.get('/:docId/download', downloadDocument);
router.delete('/:docId', deleteDocument);

module.exports = router;
