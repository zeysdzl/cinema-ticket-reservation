module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err);
  const status = err.status || 400;
  res.status(status).json({
    error: true,
    message: err.message || 'Unexpected error'
  });
};
