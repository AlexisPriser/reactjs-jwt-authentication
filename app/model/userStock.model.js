module.exports = (sequelize, Sequelize) => {
  const UserStock = sequelize.define('users', {
    lastname: {
      type: Sequelize.STRING
    },
    firstname: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    banned: {
      type: Sequelize.INTEGER
    },
    pending: {
      type: Sequelize.TINYINT
    }
  });
  
  return User;
}