const express = require('express');
const router = express.Router();
const { searchDevelopers } = require('../controllers/searchController');

// GET /api/search?q=john&skills=react,node&location=bangalore
router.get('/', searchDevelopers);

module.exports = router;
