const db = require('../config/db.config.js');
const config = require('../config/config.js');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();
const User = db.user;
const Role = db.role;
const Run = db.run;
const Enemie = db.enemie;
const Arme = db.arme;
const Perso = db.perso;

const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs');

const defMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm for your", // Subject line
    text: "Please click this link to apply your", // plain text body
    html: "", // html body
  };

const passChMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm for your password change", // Subject line
    text: "Please click this link to apply your new password", // plain text body
    html: "", // html body
  };

const pseudChMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm for your user name change", // Subject line
    text: "Please click this link to apply your new user name", // plain text body
    html: "", // html body
  };

const deleteMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm the deletion of your account", // Subject line
    text: "Please click this link to apply the deletion", // plain text body
    html: "", // html body
  };

async function Mailer(user,content){

	content.to=`${user.name} <${user.email}>`;
	/*
	const token= await jwt.sign({
		_id:user.id
	},process.env.JWT_secret_KEY)*/
	const t=user.email+process.env.JWT_secret_KEY;
	const token=bcrypt.hashSync(t, 8);

	const url=`http://localhost:3000/confirmation/${token}`;
	content.html=`<a href=${url}>${url}</a>`
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	//let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		auth: {
		user: 'zkii3qv422orhbb7@ethereal.email',
			pass: 'GHp8ZQwzcKdBwW1RNn'
		},
	});

	// setting user statue to pending
	user.pending=true;
	user.save();
	// send mail with defined transport object
	let info = await transporter.sendMail(content);

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.sendEmailPass=(req,res)=>{
	console.log("email");
	const cont=passChMsg;
	const ID=req.body.id;
	/*
	const link=ID+process.env.JWT_secret_KEY;
	const url=bcrypt.hashSync(link, 8);
	cont.html=`<a href=${url}>${url}</a>`*/

	User.findOne({// A TESTER ! //
		where: {
			id: ID
		}
	}).then(user => {

	Mailer(user,cont).then(()=>{
		return res.send("email sent");
	}).catch(console.error);
	
	}).catch(err => {
		res.status(500).send({ reason: err.message });
	});
}

exports.verifyUser =(req,res)=>{

	var confirmIsValid = false;

	User.findAll({
		where: {
		pending:0
		}
	}).then((user)=>{
		user.map((i)=>{
			if(!confirmIsValid)
			{
			confirmIsValid = bcrypt.compareSync(i.email+process.env.JWT_SECRET_KEY,req.params.confirmationCode);
			
			}
		})
		return res.send({confirmIsValid});
	}).catch((e) => console.log("error", e));
	/*
	User.findOne({
    confirmationCode: req.params.confirmationCode,
  	}).then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }else{
		return res.status(200).send({ message: "User verified." });
	  }*/


	  /*
      user.status = "Active";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });*/


	//}).catch((e) => console.log("error", e));
}

exports.deleteUser =(req,res)=>{
	console.log("delete",req.body);
User.findOne({
		where: {
			username: req.body.username
		}
	}).then(user => {
		if (!user) {
			return res.status(404).send({ reason: 'User Not Found.' });
		}
		
		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ reason: 'Invalid Password!' });
		}
		else{
			//return res.status(200).send({ reason: 'User Deleted.' });
			
			User.destroy({
				where: {
			username: req.body.username
			}
			}).then(()=>{
			return res.status(200).send({ reason: 'User Deleted.' });
			})
		}
	})
}

exports.updateUserName =(req,res)=>{
	console.log("update req",req.body);
User.findOne({
where: {
	username: req.body.nameUpdate
}}).then(toke => toke === null).then(unique => {
	
	console.log("test update",unique);

		if(!unique){
			return res.status(401).send({ reason: 'Name already taken!' });
		}
		else{

			User.findOne({
				where: {
					email: req.body.email
				}
			}).then(user => {
				console.log("update",user.username);
				
				if (!user) {
					return res.status(404).send({ reason: 'User Not Found.' });
				}
				
				var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
				if (!passwordIsValid) {
					return res.status(401).send({ reason: 'Invalid Password!' });
				}
				else{
					user.username=req.body.nameUpdate;
					user.save().then(()=>{
						return res.status(200).send({ reason: 'User name updated' });
					});
				}
			}).catch(err => {
			res.status(500).send({ reason: err.message });
			});
		}
	})
}

exports.updatePassword = (req, res) => {// demande nom email et mot de passe, envoie mail pour confirmation
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (!user) {
			return res.status(404).send({ reason: 'User Not Found.' });
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ auth: false, accessToken: null, reason: 'Invalid Password!' });
		}
		else{
		//need to add check for password complexity
		user.password=bcrypt.hashSync(req.body.newpassword, 8);
		user.save().then(()=>{
			return res.status(200).send({ reason: 'User password updated' });
		});
		}
	}).catch(err => {
		res.status(500).send({ reason: err.message });
	});
}

exports.signup = (req, res) => {
	// Save User to Database
	User.create({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 8)
	}).then(user => {
		Role.findAll({
			where: {
				name: {
					[Op.or]: req.body.roles
				}
			}
		}).then(roles => {
			user.setRoles(roles).then(() => {
				res.send({ message: 'Registered successfully!' });
			});
		}).catch(err => {
			res.status(500).send({ reason: err.message });
		});
	}).catch(err => {
		res.status(500).send({ reason: err.message });
	})
}

exports.signin = (req, res) => {
	User.findOne({
		where: {
			username: req.body.username
		}
	}).then(user => {
		if (!user) {
			return res.status(404).send({ reason: 'User Not Found.' });
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ auth: false, accessToken: null, reason: 'Invalid Password!' });
		}

		var token = jwt.sign({ id: user.id }, config.secret, {
			expiresIn: 86400 // expires in 24 hours
		});

		var authorities = [];
		user.getRoles().then(roles => {
			for (let i = 0; i < roles.length; i++) {
				authorities.push('ROLE_' + roles[i].name.toUpperCase());
			}
			res.status(200).send({
				auth: true,
				accessToken: token,
				username: user.username,
				authorities: authorities
			});
		})
	}).catch(err => {
		res.status(500).send({ reason: err.message });
	});
}

exports.userContent = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			'description': '>>> User Contents!',
			'user': user
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access User Page',
			'error': err
		});
	})
}

exports.adminBoard = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			'description': '>>> Admin Contents',
			'user': user
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Admin Board',
			'error': err
		});
	})
}

exports.managementBoard = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			'description': '>>> Project Management Board',
			'user': user
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Management Board',
			'error': err
		});
	})
}

/********************************liste scores*******************************/

exports.getAllRun = (req, res) => {
	Run.findAll(
		{
		include: [
		{model:Enemie, as:'enemy',required: false,attributes:['idenemies','nom']},
		{model:User, as:'User',required: false,attributes:['id','username']},
		{model:Arme, as:'Arme1',required: false,attributes:['idarme','nom']},
		{model:Arme, as:'Arme2',required: false,attributes:['idarme','nom']},
		{model:Perso, as:'Perso',required: false,attributes:['idpersos','nom']}
		],
		order:[['idrun', 'ASC']]
		}
		
		//{attributes:['idrun'],include: [{model:Enemie, as:'enemie', required:false, attributes:['nom']}]}
		).then(run => {
		res.status(200).send({
			'description': '>>> Run Contents!',
			'run': run
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Run',
			'error': err
		});
	})
}

exports.getAllRunUser = (req, res) => {
	Run.findAll(
		{
		include: [
		{model:Enemie, as:'enemy',required: false,attributes:['idenemies','nom']},
		{model:User, as:'User',required: false,attributes:['id','username']},
		{model:Arme, as:'Arme1',required: false,attributes:['idarme','nom']},
		{model:Arme, as:'Arme2',required: false,attributes:['idarme','nom']},
		{model:Perso, as:'Perso',required: false,attributes:['idpersos','nom']}
		],
		where:{'$User.id$':req.userId},
		order:[['idrun', 'ASC']]
		}
		
		//{attributes:['idrun'],include: [{model:Enemie, as:'enemie', required:false, attributes:['nom']}]}
		).then(run => {
		res.status(200).send({
			'description': '>>> Run Contents!',
			'run': run
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Run',
			'error': err
		});
	})
}

exports.getAllUser = (req, res) => {
	User.findAll().then(user => {
		res.status(200).send({
			'description': '>>> Users Contents!',
			'user': user
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Users',
			'error': err
		});
	})
}

exports.getAllEnemies = (req, res) => {
	Enemie.findAll().then(enemie => {
		res.status(200).send({
			'description': '>>> Enemies Contents!',
			'enemie': enemie
		});
	}).catch(err => {
		res.status(500).send({
			'description': 'Can not access Enemies',
			'error': err
		});
	})
}