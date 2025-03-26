const express = require('express');
const { getSlotsByDoctor } = require('../controllers/slotController.js');

const router = express.Router();

router.get('/:doctorId', getSlotsByDoctor);

module.exports = router;