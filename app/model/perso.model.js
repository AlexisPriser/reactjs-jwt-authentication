module.exports = (sequelize, Sequelize) => {
  const Persos = sequelize.define('persos', {
    idpersos: {
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
  
  return Persos;
}