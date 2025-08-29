

exports.notFound = (req, res, next) => {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
};

exports.errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    message: err.message || "Internal Server Error",
  };
  if (err.errors) payload.errors = err.errors; 
  if (process.env.NODE_ENV !== "production" && err.stack)
    payload.stack = err.stack;
  res.status(status).json(payload);
};
