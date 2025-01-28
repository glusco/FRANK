const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router; 