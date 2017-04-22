var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var validator = require("express-validator");
var session = require("express-session");
var bcrypt = require("bcrypt");

var app = express();
var salt = bcrypt.genSaltSync(10);				//set the hash salt
app.set("view engine","ejs");					//set the template engine as embedded-javascrtipt
app.use(express.static("public"));				//set the folder "public" for static files
app.use(bodyParser.urlencoded({extended:true}));	//this allows capturing of form inputs
app.use(validator());								//set express validation	
app.use(session({secret:"ssshhhhh"}));				//set session secret
app.use(bodyParser.json());							//allows json transfer


var url = "mongodb://noordean:ibrahim5327@ds161190.mlab.com:61190/nurudb";//database url
var sess;										//global declaration of session
MongoClient.connect(url,function(err,database){

	if (err){
		throw new Error(err);
	}
	else{

		//server running at 3000
		var port = process.env.PORT || 3000;
		app.listen(port,function(){
			console.log("Server now running ");
		});

		//renders the login page(i.e the index page)
		app.get("/",function(req,res){
			sess = req.session;
			if(sess.user){						//if session is previously set, then destroy it
				req.session.destroy(function(err){
					if (err){
						throw new Error(err);
					}
				});
			}
			res.render("index.ejs",{error:"",inputValues:""});
		});

		//renders the sign up page
		app.get("/showSignUp",function(req,res){
			res.render("signup.ejs",{error:"",inputValues:""});
		});

		/*this handles users registration
		 *it checks if there is a record with the same username from the request body
		 */
		app.post("/register",function(req,res){
			database.collection("users").find({username:req.body.username}).toArray(function(err,result){

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

				if(req.body.username.length < 8 || req.body.password.length < 8){					//if the username or password is too short
					errors.push({"param":"username/password","msg":"Username and Password must contain atleast 8 characters"});
				}

				
				if(errors.length > 0){
					res.render("signup.ejs",{error:errors,inputValues:req.body});
				}
				else if(result.length > 0){
					res.render("signup.ejs",{error:[{"msg":"You have registered before, kindly go to login page"}],inputValues:req.body});
				}
				else{
					var hashedPassword = bcrypt.hashSync(req.body.password,salt);
					req.body.password = hashedPassword;			//replace user's password with the hashed one
					database.collection("users").save(req.body,function(err,result){
						if(err){
							throw new Error(err);
						}
						else{
							res.render("successfulRegistration.ejs");	
						}
					});

				}
			
			
			});
		});

		/*this handles document search
		 *based on the request from browser
		 */
		app.post("/search",function(req,res){
			if(req.body.searchTitleValue){
				database.collection("documents").find({title:req.body.searchTitleValue}).sort({time:-1}).toArray(function(err,result){
					if(err){
						throw new Error(err);
					}
					else{
						res.send(result);
					}
				});
			}
			if(req.body.searchDepartmentValue){
				database.collection("documents").find({department:req.body.searchDepartmentValue}).sort({time:-1}).toArray(function(err,result){
					if(err){
						throw new Error(err);
					}
					else{
						res.send(result);
					}
				});
			}
			if(req.body.searchKeywordValue){
				database.collection("documents").find({keyword:req.body.searchKeywordValue[0]}).sort({time:-1}).toArray(function(err,result){
					if(err){
						throw new Error(err);
					}
					else{
						res.send(result);
					}
				});
			}
			if(req.body.searchUsernameValue){
				database.collection("documents").find({user:req.body.searchUsernameValue}).sort({time:-1}).toArray(function(err,result){
					if(err){
						throw new Error(err);
					}
					else{
						res.send(result);
					}
				});
			}

		});

		//this handles users login
		app.post("/login",function(req,res){
			sess = req.session;
			database.collection("users").find({username:req.body.username}).toArray(function(err,result){

				if(err){
					throw new Error(err);
				}
				else{
					if(result.length>0){
						if(bcrypt.compareSync(req.body.password,result[0].password)){
							sess.user = req.body.username;

							database.collection("documents").find({user:sess.user}).sort({time:-1}).limit(5).toArray(function(err,result){
								if(err){
									throw new Error(err);
								}
								else{
									if(result.length===0){
										res.render("dashboard.ejs",{user:sess.user,query:"",message:"You have not created any document"});
									}
									else{
										res.render("dashboard.ejs",{user:sess.user,query:result,message:""});
									}
								}
							});

						}
						else{
							res.render("index.ejs",{error:"incorrect email or password",inputValues:req.body})	
						}
					}
					else{
						res.render("index.ejs",{error:"incorrect email or password",inputValues:req.body})
					}
				}

			});

		});

		app.get("/login",function(req,res){
			sess = req.session;
			if(sess.user){						//if session is set, then query database and allow acess to dashboard
				database.collection("documents").find({user:sess.user}).sort({time:-1}).limit(5).toArray(function(err,result){
					if(err){
						throw new Error(err);
					}
					else{
						if(result.length===0){
							res.render("dashboard.ejs",{user:sess.user,query:"",message:"You have not created any document"});
						}
						else{
							res.render("dashboard.ejs",{user:sess.user,query:result,message:""});
						}
					}
				});

			}
			else{
				res.redirect("/");
			}
		});

		app.get("/logOut",function(req,res){
			req.session.destroy(function(err){
				if(err){
					throw new Error(err);
				}
				else{
					res.redirect("/");
				}
			});
		});

		//this render searchDocument page
		app.get("/searchDocument",function(req,res){
			sess = req.session;
			if(sess.user){
				res.render("searchDocument.ejs",{user:sess.user});
			}
			else{
				res.redirect("/");
			}
		});

		app.get("/createDocument",function(req,res){
			sess = req.session;
			if(sess.user){
				res.render("createDocument.ejs",{error:"",inputValues:"",user:sess.user});
			}
			else{
				res.redirect("/");
			}
		});

		app.get("/register",function(req,res){
			res.redirect("/");	
		});

		//this handles creation of new document
		app.post("/createDocument",function(req,res){
			sess = req.session;
			database.collection("documents").find({url:req.body.url}).toArray(function(err,result){
				if(err){
					throw new Error(err);
				}
				else{
					if(result.length>0){
						res.render("createDocument.ejs",{error:[{"msg":"This file has already been added, kindly search for it to avoid file duplicate"}],inputValues:req.body,user:sess.user});
					}
					else{
						

							//trim and escape user inputs	
							req.sanitizeBody("title").trim();
							req.sanitizeBody("title").escape();
							req.sanitizeBody("url").trim();
							req.sanitizeBody("keyword").trim();

							//validate user inputs
							req.checkBody("title","Title must contain only letters").notEmpty();
							req.checkBody("url","A valid url address is required").notEmpty().isURL();
							req.checkBody("department","Department can not be empty").notEmpty();

							var keyword = [];
							var keywordsArray;
							if(req.body.keyword.length>0){
							 	keywordsArray = req.body.keyword.split(",");
		
								for(var i=0;i<keywordsArray.length;i++){
									keyword.push(keywordsArray[i].trim());
								}
							}

							req.body.time = Date.now(); 	//add the time of creation to the body object
							req.body.keyword = keyword ; 	//change the keyword in the request body to the generated array
							req.body.user = sess.user;

							var errors = req.validationErrors();
							if(errors.length>0){
								res.render("createDocument.ejs",{error:errors,inputValues:req.body,user:sess.user});
							}
							else{

								if(req.body.url.match("^http")===null){
									req.body.url = "https://"+req.body.url;
									}
								database.collection("documents").save(req.body,function(err,result){
									if(err){
										throw new Error(err);
									}
									else{

										res.render("documentSuccessful.ejs",{documentAdded:req.body,user:sess.user});
									}
								});
							}
						}
					}
			});
		});
	}

});