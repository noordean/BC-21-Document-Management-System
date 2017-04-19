var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var validator = require("express-validator");

var app = express();
app.set("view engine","ejs");				//set the template engine as embedded-javascrtipt
app.use(express.static("public"));				//set the folder "public" for static files
app.use(bodyParser.urlencoded({extended:true}));	//this allows capturing of form inputs
app.use(validator());


MongoClient.connect("mongodb://localhost:27017/nurudb",function(err,database){

	if(err){
		throw new Error(err);
	}
	else{
		app.get("/showUsers",function(req,res){
			database.collection("users").find().toArray(function(err,result){
				res.send(result);
			});
		});
		app.get("/showDocuments",function(req,res){
			database.collection("documents").find().toArray(function(err,result){
				res.send(result);
			});
		});

		app.get("/deleteDocuments",function(req,res){
			database.collection("documents").remove({});
		})

		//server running at 3000
		app.listen(3000,function(){
			console.log("Server running at port: 3000");
		});

		//renders the login page(i.e the index page)
		app.get("/",function(req,res){
			res.render("index.ejs",{error:"",inputValues:""});
		});

		//renders the sign up page
		app.get("/showSignUp",function(req,res){
			res.render("signup.ejs",{error:"",inputValues:""});
		});

		//this handles users registration
		app.post("/register",function(req,res){
			database.collection("users").find().toArray(function(err,result){
				var usersEmails = [];							//get all the emails in the table "users"
				var usersUsernames = [];						//get all the username in the table "users"
				for(var i=0;i<result.length;i++){
					usersEmails.push(result[i].email);
					usersUsernames.push(result[i].username);			
				}

				//trim and escape user inputs	
				req.sanitizeBody("username").trim();
				req.sanitizeBody("username").escape();
				req.sanitizeBody("email").trim();
				req.sanitizeBody("email").escape();
				req.sanitizeBody("password").trim();
				req.sanitizeBody("password").escape();
				req.sanitizeBody("retypePassword").trim();
				req.sanitizeBody("retypePassword").escape();

				//validate user inputs
				req.checkBody("username","Username should contain only alphanumeric characters").notEmpty().isAlphanumeric();
				req.checkBody("email","A valid email address is required").notEmpty().isEmail();
				req.checkBody("password","Password should contain only alphanumeric characters").notEmpty().isAlphanumeric();

				var errors = [];			//collect validation errors
				if(req.validationErrors()){
					errors = req.validationErrors();
				}

				if(req.body.password != req.body.retypePassword){
					errors.push({"param":"password","msg":"The two passwords did not match"});		//if the passwords do not tally 
				}

				if(req.body.username.length<8 || req.body.password.length<8){					//if the username or password is too short
					errors.push({"param":"username/password","msg":"Username and Password must contain atleast 8 characters"});
				}

				
				if(errors.length > 0){
					res.render("signup.ejs",{error:errors,inputValues:req.body});
				}
				else if(usersEmails.indexOf(req.body.email)!=-1 || usersUsernames.indexOf(req.body.username)!=-1){
					res.render("signup.ejs",{error:[{"msg":"You have registered before, kindly go to login page"}],inputValues:req.body});
				}
				else{
					database.collection("users").save(req.body,function(err,result){
						if(err){
							throw new Error(err);
						}
						else{
							res.writeHead(200,{"Content-Type":"text/html"});
							res.write("<h1>Registration Successful</h1>");
							res.end("<a href='/'>Click here to login</a>");	
						}
					});

				}
			
			
			});
		});

		//this handles users login
		app.post("/login",function(req,res){
			database.collection("users").find().toArray(function(err,result){
				if(err){
					throw new Error(err);
				}
				else{
					var usersUsernames = [];		//collect usernames in the database
					var usersPasswords = [];					//collect passwords in the database
					for(var i=0;i<result.length;i++){
						usersUsernames.push(result[i].username);
						usersPasswords.push(result[i].password);			
					}


					if(req.body.username==="" || req.body.password===""){			//check for empty username or password
						res.render("index.ejs",{error:"The fields can't be empty",inputValues:req.body});
					}

					//this checks if the user is registered
					else if(usersUsernames.indexOf(req.body.username)!=-1 && usersPasswords.indexOf(req.body.password)!=-1){		
						if(usersUsernames.indexOf(req.body.username)===usersPasswords.indexOf(req.body.password)){
							res.render("dashboard.ejs");
						}
						else{
							res.render("indexejs",{error:"incorrect email or password",inputValues:req.body});
						}
					}
					else{
						res.render("index.ejs",{error:"incorrect email or password",inputValues:req.body});
					}
				}
			});

		});

		app.get("/login",function(req,res){
			res.render("dashboard.ejs");
		});

		app.get("/searchDocument",function(req,res){
			res.render("searchDocument.ejs");
		});

		app.get("/createDocument",function(req,res){
			res.render("createDocument.ejs",{error:"",inputValues:""});
		});

		app.post("/createDocument",function(req,res){
			database.collection("documents").find({url:req.body.url}).toArray(function(err,result){
				if(err){
					throw new Error(err);
				}
				else{
					if(result.length>0){
						res.render("createDocument.ejs",{error:[{"msg":"This file has already been added, kindly search for it to avoid file duplicate"}],inputValues:req.body});
					}
					else{
						//trim and escape user inputs	
							req.sanitizeBody("title").trim();
							req.sanitizeBody("title").escape();
							req.sanitizeBody("url").trim();

							//validate user inputs
							req.checkBody("title","Title must contain only letters").notEmpty().isAlpha();
							req.checkBody("url","A valid url address is required").notEmpty().isURL();
							req.checkBody("department","Department can not be empty").notEmpty();

							var errors = req.validationErrors();
							if(errors.length>0){
								res.render("createDocument.ejs",{error:errors,inputValues:req.body});
							}
							else{
								database.collection("documents").save(req.body,function(err,result){
									if(err){
										throw new Error(err);
									}
									else{
										res.render("documentSuccessful.ejs",{documentAdded:req.body});
									}
								});
							}
						}
					}
			});
		});
	}

});