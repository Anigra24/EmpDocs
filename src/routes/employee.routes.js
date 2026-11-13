const express = require('express');

const{
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    patchEmployee,
    deleteEmployee
} = require('../controllers/employee.controller');

const router = express.Router();

router.post('/',createEmployee);
router.get('/', getEmployees);

router.get('/:id',getEmployeeById);
router.put('/:id',updateEmployee);
router.patch('/:id',patchEmployee);
router.delete('/:id',deleteEmployee);

module.exports = router;