const usersSchema = {
  name: String,
  email: String,
  password: String,
  failed_login_attempts: Number,
  last_failed_login_at: Date,
  banned: Boolean,
};

module.exports = usersSchema;
