module.exports = (sequelize, Sequelize) => {
  const Arme = sequelize.define('arme', {
    idarme: {
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
  
  return Arme;
}