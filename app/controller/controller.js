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
    text: "Please click this link to apply your. Beyond 5 minutes the change is canceled.", // plain text body
    html: "", // html body
  };

const passChMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm for your password change", // Subject line
    text: "Please click this link to apply your new password. Beyond 5 minutes the change is canceled.", // plain text body
    html: "", // html body
  };

const nameChMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm for your user name change", // Subject line
    text: "Please click this link to apply your new user name. Beyond 5 minutes the change is canceled.", // plain text body
    html: "", // html body
  };

const deleteMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "Confirm the deletion of your account", // Subject line
    text: "Please click this link to apply the deletion. Beyond 5 minutes the change is canceled.", // plain text body
    html: "", // html body
  };

  const ErrorMsg={
    from: 'no-reply@NEleaderboard.com', // sender address
    to: "", // list of receivers
    subject: "An error occured", // Subject line
    text: "Please retry your action", // plain text body
    html: "", // html body
  };
  // user: a user from model, type: "password", "name", "delete"
const PaternURL=(user,type)=>{
	const t=user.username+user.email+user.password+process.env.JWT_secret_KEY+type;
	return t;
}

const setUserProcessDate=(user)=>{
	var currentdate = new Date(); 
	console.log("raw date",currentdate);
	var datetime = currentdate.getFullYear() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getDate() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	console.log("date",Date.parse(datetime));
	//datetime=new Date().toLocaleString();
	var A=Date.parse(datetime);
	var B=Date.parse(user.processdate);
	var R=A-B;
	console.log("R",R);

	if(R>=300000 || user.processdate===null)
	{
	user.processdate=datetime;
	user.save().then(()=>{
			return true;
		});
	}
	else
	{
	return false;
	}
	
	//res.send(new Date().toLocaleString());/**************** test */
}

async function Mailer(user,content,type){

	content.to=`${user.name} <${user.email}>`;
	/*
	const token= await jwt.sign({
		_id:user.id
	},process.env.JWT_secret_KEY)*/
	const t=PaternURL(user,type);
	const bt=bcrypt.hashSync(t, 8);
	const token=encodeURIComponent(bt);
	console.log("mail code:",bt);

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
	//1=password
	//2=name
	//3=delete
	if(type==="password"){user.pending=1;}
	if(type==="name"){user.pending=2;}
	if(type==="delete"){user.pending=3;}
	
	user.save();
	// send mail with defined transport object
	let info = await transporter.sendMail(content);

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.sendEmailPass=(req,res)=>{// fonction pour teste email
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
		return res.send("email pass sent");
	}).catch(console.error);
	
	}).catch(err => {
		res.status(500).send({ reason: err.message });
	});
}

exports.verifyUserValidNewPass =(req,res)=>{// si tous dans l'URL chiffré correspond a l'utilisateur c'est valid
	
	var confirmIsValid = false;
	var gate = false;
	const confirmationCode=decodeURIComponent(req.params.confirmationCode);
	console.log("confirmationCode ",confirmationCode);
	User.findAll({
		where: {
		pending:1,
		change: {[Op.not]:null}
		}
	}).then((users)=>{

		users.map((user)=>{
			const s=PaternURL(user,"password");
			if(!gate)
			{
			console.log("user",user.username);
			gate = bcrypt.compareSync(s,confirmationCode);
			console.log("gate",gate);
			}

			if(gate)
			{
			gate=false;
			confirmIsValid=true;
			user.password=user.change;
			user.change=null;
			user.pending=0;
			user.save().then(()=>{
						return res.status(200).send({ reason: 'User password updated' });
					});
			}
		})
		return res.send({confirmIsValid});

	}).catch((e) => console.log("error", e));
}

exports.verifyUserValidNewName =(req,res)=>{// si tous dans l'URL chiffré correspond a l'utilisateur c'est valid
	
	var confirmIsValid = false;
	var gate = false;
	const confirmationCode=decodeURIComponent(req.params.confirmationCode);
	console.log("confirmationCode ",confirmationCode);
	User.findAll({
		where: {
		pending:2,
		change: {[Op.not]:null}
		}
	}).then((users)=>{

		users.map((user)=>{
			const s=PaternURL(user,"name");
			if(!gate)
			{
			console.log("user",user.username);
			gate = bcrypt.compareSync(s,confirmationCode);
			console.log("gate",gate);
			}

			if(gate)
			{
			gate=false;
			confirmIsValid=true;
			user.username=user.change;
			user.change=null;
			user.pending=0;
			user.save().then(()=>{
						return res.status(200).send({ reason: 'User name updated' });
					});
			}
		})
		return res.send({confirmIsValid});

	}).catch((e) => console.log("error", e));
}

exports.verifyUserValidDelete =(req,res)=>{// si tous dans l'URL chiffré correspond a l'utilisateur c'est valid
	
	var confirmIsValid = false;
	var gate = false;
	const confirmationCode=decodeURIComponent(req.params.confirmationCode);
	console.log("confirmationCode ",confirmationCode);
	User.findAll({
		where: {
		pending:3,
		change: {[Op.not]:null}
		}
	}).then((users)=>{

		users.map((user)=>{
			const s=PaternURL(user,"delete");
			if(!gate)
			{
			console.log("user",user.username);
			gate = bcrypt.compareSync(s,confirmationCode);
			console.log("gate",gate);
			}

			if(gate)
			{
			gate=false;
			confirmIsValid=true;
				User.destroy({
					where: {
				username: user.username
				}
				}).then(()=>{
				return res.status(200).send({ reason: 'User Deleted.' });
				})
			}
		})
		return res.send({confirmIsValid});

	}).catch((e) => console.log("error", e));
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
			Mailer(user,deleteMsg,"delete");
			return res.status(200).send({ reason: 'User in deletion' });
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

				if(!setUserProcessDate(user)){
					return res.status(404).send({ reason: 'One of user operation is already in queue.' });
				}
				
				var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
				if (!passwordIsValid) {
					return res.status(401).send({ reason: 'Invalid Password!' });
				}
				else
				{
					user.change=req.body.nameUpdate;
					user.save().then(()=>{
						Mailer(user,nameChMsg,"name");
						return res.status(200).send({ reason: 'User new name in change' });
					});
					/*
					user.username=req.body.nameUpdate;
					user.save().then(()=>{
						return res.status(200).send({ reason: 'User name updated' });
					});*/
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

		if(!setUserProcessDate(user)){
			return res.status(404).send({ reason: 'One of user operation is already in queue.' });
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ auth: false, accessToken: null, reason: 'Invalid Password!' });
		}
		else{
		//need to add check for password complexity
		user.change=bcrypt.hashSync(req.body.newpassword, 8);
		user.save().then(()=>{
			Mailer(user,passChMsg,"password");
			return res.status(200).send({ reason: 'User new password in change' });
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