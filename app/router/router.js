const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');
 
module.exports = function (app) {
 
  const controller = require('../controller/controller.js');
 
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });
 
  app.post('/api/auth/signup', [verifySignUp.checkDuplicateUserNameOrEmail], controller.signup);
 
  app.post('/api/auth/signin', controller.signin);

  app.post('/api/delete/user', controller.deleteUser);

  app.post('/api/update/username', controller.updateUserName);

  app.post('/api/update/password', controller.updatePassword);

  app.post('/api/auth/mail',controller.sendEmailPass);

  app.get("/api/auth/PasswordConfirm/:confirmationCode", controller.verifyUserValidNewPass);

  app.get("/api/auth/NameConfirm/:confirmationCode", controller.verifyUserValidNewName);
 
  app.get('/api/test/user', [authJwt.verifyToken], controller.userContent);
 
  app.get('/api/test/pm', [authJwt.verifyToken, authJwt.isPmOrAdmin], controller.managementBoard);
 
  app.get('/api/test/admin', [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

  app.get('/api/get/run', controller.getAllRun);

  app.get('/api/get/runuser', [authJwt.verifyToken], controller.getAllRunUser);

  app.get('/api/get/enemie', controller.getAllEnemies);

  app.get('/api/get/user', controller.getAllUser);
}