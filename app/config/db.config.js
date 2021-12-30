const DB=require("./env.js");

const Sequelize = require('sequelize');
const sequelize = new Sequelize(DB);
 
const db = {};
 
db.Sequelize = Sequelize;
db.sequelize = sequelize;
 
db.user = require('../model/user.model.js')(sequelize, Sequelize);
db.role = require('../model/role.model.js')(sequelize, Sequelize);
db.run = require('../model/run.model.js')(sequelize, Sequelize);
db.enemie = require('../model/enemie.model.js')(sequelize, Sequelize);
db.arme = require('../model/arme.model.js')(sequelize, Sequelize);
db.perso = require('../model/perso.model.js')(sequelize, Sequelize);
 
db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId'});
db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId'});

//caught Error: Naming collision between attribute 'arme' and association 'arme' on model run. To remedy this, change either foreignKey or as in your association definition

db.enemie.hasMany(db.run, {foreignKey :'enemie'})
db.run.belongsTo(db.enemie, {foreignKey :'enemie'});

db.user.hasMany(db.run, {foreignKey :'user'})
db.run.belongsTo(db.user, {foreignKey :'user' ,as:'User' });

db.perso.hasMany(db.run, {foreignKey :'perso'})
db.run.belongsTo(db.perso, {foreignKey :'perso' ,as:'Perso'});

db.arme.hasMany(db.run, {foreignKey :'arme1'})
db.run.belongsTo(db.arme, {foreignKey :'arme1' ,as:'Arme1' });

db.arme.hasMany(db.run, {foreignKey :'arme2'})
db.run.belongsTo(db.arme, {foreignKey :'arme2' ,as:'Arme2' });

module.exports = db;