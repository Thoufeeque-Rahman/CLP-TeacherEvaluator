const express = require("express");
const Movies = require("../models/Movies");
const router = express.Router();

// get Movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movies.find({title:"The Great Train Robbery"}).exec();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
