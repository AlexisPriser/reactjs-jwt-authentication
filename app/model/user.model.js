module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('users', {
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
    },
    change: {
      type: Sequelize.STRING
    },
    processdate:{
      type: Sequelize.DATE
    }
  });
  
  //pending: 1=password, 2=username
  return User;
}