export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,

  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    schema: process.env.DATABASE_SCHEMA,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  jwt: {
    accessTokenSecret: process.env.JWT_ACCESSTOKEN_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESHTOKEN_SECRET,
  },

  mail: {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
