const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};
const secret_key = process.env.JWT;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

User.byToken = async (token) => {
  try {
    console.log("this is the output of byToken -->", token);
    const verified = await jwt.verify(token, secret_key);
    console.log("verified", verified);
    const user = await User.findByPk(verified);
    console.log(user);
    if (user) {
      return user;
    }
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  // const hashedPassword = await hashPassword(password);
  // password = hashedPassword;
  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (!user) {
    throw "no";
  }
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    return user.id;
  }
  const error = Error("bad credentials");
  error.status = 401;
  throw error;
};

async function hashPassword(password) {
  const saltCount = 5;
  return await bcrypt.hash(password, saltCount);
}

// bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
//   // result == true
// });
// bcrypt.compare((someOtherPlaintextPassword, hash) {
//   // result == false
// });

User.beforeCreate(async (user) => {
  const hashedPassword = await hashPassword(user.password);
  user.password = hashedPassword;
});

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};
