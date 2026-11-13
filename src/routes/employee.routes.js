const express = require('express');

const{
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    patchEmployee,
    deleteEmployee
} = require('../controllers/employee.controller');

const{
    ensureEmployeeExists,
    uploadDocument,
    uploadBulkDocuments,
    getEmployeeDocuments,
    getDocumentContent
} = require('../controllers/document.controller')

const{
    uploadSingleDocument,
    uploadMultipleDocuments
} = require('../middlewares/upload.middleware')

const router = express.Router();

router.post(
    '/:id/documents',
    ensureEmployeeExists,
    uploadSingleDocument,
    uploadDocument
);

router.post(
    '/:id/documents/bulk',
    ensureEmployeeExists,
    uploadMultipleDocuments,
    uploadBulkDocuments
);

router.get(
    '/:id/documents',
    ensureEmployeeExists,
    getEmployeeDocuments
);

router.get('/:docId/content',getDocumentContent)

router.post('/',createEmployee);
router.get('/', getEmployees);

router.get('/:id',getEmployeeById);
router.put('/:id',updateEmployee);
router.patch('/:id',patchEmployee);
router.delete('/:id',deleteEmployee);

module.exports = router;