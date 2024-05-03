const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    const isBanned = await authenticationServices.isBanned(email);

    if (isBanned) {
      const isRemoveBan = await authenticationServices.isRemoveBan(email);

      if (isRemoveBan) {
        await authenticationServices.resetFailedLoginAttempts(email);
      } else {
        throw errorResponder(
          errorTypes.TOO_MANY_FAILED_ATTEMPTS,
          'Too many failed login attempts. Please try again later.'
        );
      }
    }

    // Check if the user has exceeded the limit of failed login attempts
    const limitExceeded =
      await authenticationServices.isLoginLimitExceeded(email);

    if (limitExceeded) {
      await authenticationServices.bannedLoginAttempt(email);

      throw errorResponder(
        errorTypes.TOO_MANY_FAILED_ATTEMPTS,
        'Too many failed login attempts. Please try again later.'
      );
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Increment failed login attempts and update the last failed login time
      await authenticationServices.incrementFailedLoginAttempts(email);

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Reset failed login attempts for successful login
    await authenticationServices.resetFailedLoginAttempts(email);

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
