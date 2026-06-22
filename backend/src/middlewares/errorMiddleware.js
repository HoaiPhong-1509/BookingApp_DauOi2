export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
    errors: [],
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Server error. Please try again later.",
    errors: [],
  });
};
