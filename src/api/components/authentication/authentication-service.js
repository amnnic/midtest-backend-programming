const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { User } = require('../../../models');
const { hash } = require('bcrypt');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  return null;
}

async function isLoginLimitExceeded(email) {
  // Retrieve user by email
  const user = await authenticationRepository.getUserByEmail(email);

  if (!user) {
    // If user doesn't exist, return false
    return false;
  }

  // Check if failed login attempts exceed the limit
  return user.failed_login_attempts >= 5;
}

async function resetFailedLoginAttempts(email) {
  // Find the user by email and update the failed_login_attempts field
  await User.updateOne(
    { email },
    { $set: { failed_login_attempts: 0, banned: false } }
  );
}

async function incrementFailedLoginAttempts(email) {
  const currentTime = new Date();
  // Find the user by email and increment the failed_login_attempts field
  // Also update the timestamp field with the current time
  await User.updateOne(
    { email },
    {
      $inc: { failed_login_attempts: 1 },
      $set: { last_failed_login_at: currentTime },
    }
  );
}

async function bannedLoginAttempt(email) {
  await User.updateOne(
    { email },
    {
      $set: { banned: true },
    }
  );
}

async function isBanned(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  if (!user) {
    // If user doesn't exist, return false
    return false;
  }

  // Check if failed login attempts exceed the limit
  return user.banned;
}

async function isRemoveBan(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  if (!user) {
    return false;
  }

  const lastFailedLoginTime = user.last_failed_login_at;

  if (!lastFailedLoginTime) {
    return false;
  }

  const currentTime = new Date();
  const timeDifference = currentTime - lastFailedLoginTime;
  const timeDifferenceInMinutes = timeDifference / (1000 * 60);

  return timeDifferenceInMinutes > 30;
}

module.exports = {
  checkLoginCredentials,
  isLoginLimitExceeded,
  incrementFailedLoginAttempts,
  resetFailedLoginAttempts,
  bannedLoginAttempt,
  isBanned,
  isRemoveBan,
};
