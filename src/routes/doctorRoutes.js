const express=require('express');

const {getAllDoctors,getDoctorById,searchDoctors,filterDoctors,deleteDoctor}=require('../controllers/doctorController');

const router=express.Router();

router.post('/filter', filterDoctors);
router.get('/search',searchDoctors);
router.get('/',getAllDoctors);
router.get('/:id',getDoctorById);
router.delete('/:id', deleteDoctor);

module.exports=router;