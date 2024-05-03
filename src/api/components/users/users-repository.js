const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers({ page_number, page_size, sort, search }) {
  let query = User.find({});

  if (search) {
    const [field, value] = search.split(':');
    query = query.where(field).regex(new RegExp(value, 'i'));
  }

  if (sort) {
    const [field, order] = sort.split(':');
    const sortCriteria = {};
    sortCriteria[field] = order === 'desc' ? -1 : 1;
    query = query.sort(sortCriteria);
  }

  const total_count = await User.countDocuments(query);
  const total_pages = Math.ceil(total_count / page_size);
  const skip = (page_number - 1) * page_size;
  const users = await query.skip(skip).limit(page_size);

  return {
    page_number: parseInt(page_number) || 1,
    page_size: parseInt(page_size) || total_count,
    count: total_count,
    total_pages: total_pages,
    has_previous_page: page_number > 1,
    has_next_page: skip + users.length < total_count,
    data: users,
  };
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
