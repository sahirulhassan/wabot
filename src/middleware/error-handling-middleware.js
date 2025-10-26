export default function errorHandler(err, req, res, next) {
  console.error(err.message, err.stack);
  return res
    .status(err.statusCode || 500)
    .json(err.userFriendlyError || "Internal Server Error.");
}
