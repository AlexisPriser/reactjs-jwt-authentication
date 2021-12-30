module.exports = (sequelize, Sequelize) => {
  const Run = sequelize.define('run', {
    idrun: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
      type: Sequelize.INTEGER
    },
    date: {
      type: Sequelize.DATE
    },
    score: {
      type: Sequelize.INTEGER
    },
    arme1: {
      type: Sequelize.INTEGER
    },
    arme2: {
      type: Sequelize.INTEGER
    },
    perso: {
      type: Sequelize.INTEGER
    },
    zone: {
      type: Sequelize.STRING
    },
    kills: {
      type: Sequelize.INTEGER
    },
    enemie: {
      type: Sequelize.INTEGER
    },
    place: {
      type: Sequelize.INTEGER
    },
    user: {
      type: Sequelize.INTEGER
    },
  }, 
  /*{
    classMethods: {
        associate: function ( models ) {
            users.belongsTo(models.enemie, {foreignKey: enemie})
        }
    }
  }*/
  );
  
  return Run;
}