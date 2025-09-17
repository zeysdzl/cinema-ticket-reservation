const store = require('../services/dataStore');

exports.listMovies = async (req, res, next) => {
  try {
    const movies = await store.read('movies.json');
    res.json(movies);
  } catch (err) {
    next(err);
  }
};
