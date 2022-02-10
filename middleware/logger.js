/**
 * @description Logs URL of every user request to console.
 */
function logger(req, res, next) {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  next();
}

module.exports = logger;