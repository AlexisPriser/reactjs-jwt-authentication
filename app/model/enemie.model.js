module.exports = (sequelize, Sequelize) => {
  const Enemie = sequelize.define('enemies', {
    idenemies: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
      type: Sequelize.STRING
    }
  },{
    freezeTableName: true
  });
  
  return Enemie;
}