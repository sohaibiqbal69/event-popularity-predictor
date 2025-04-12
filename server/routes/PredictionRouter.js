// server/routes/PredictionRouter.js
const express = require('express');
const router = express.Router();
const { getPredictions, getEventPrediction } = require('../controllers/PredictionController');

router.get('/', getPredictions);
router.get('/:eventId', getEventPrediction);

module.exports = router;