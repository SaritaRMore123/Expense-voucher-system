const rateLimit = require("express-rate-limit");

// Slows down brute-force password guessing on /auth/login.
// After 8 attempts from the same IP within 15 minutes, further attempts
// are blocked until the window resets. This never locks an individual
// account, only throttles a source IP hammering the endpoint.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts from this network. Please wait 15 minutes and try again." },
});

module.exports = { loginLimiter };
