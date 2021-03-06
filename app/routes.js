module.exports = function(app, passport, fs, now) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        if (req.isAuthenticated()){
            fs.readdir(__dirname+'/download/'+req.user._id, function (err, files) {
                if (err) return console.error(err)
                res.render('profile.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    files: files,
                    dirname:req.user._id
                });
            });
        }else {
            res.render('index.ejs', {isLogin: req.isAuthenticated()}); // load the index.ejs file
        }
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        if(!fs.existsSync(__dirname +'/download/' +req.user._id)){
            fs.mkdirSync(__dirname +'/download/' +req.user._id);
            console.log("create");
        }
        fs.readdir(__dirname+'/download/'+req.user._id, function (err, files) {
            if (err) return console.error(err)
            res.render('profile.ejs', {
                user : req.user, // get the user out of session and pass to template
                files: files,
                dirname:req.user._id
            });
        });
    });

    app.post('/profile', isLoggedIn, function(req, res) {
        download_file(req,res,fs,now);
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/mlogin', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.send("Wrong email or password!!!")
    });

    app.get('/mprofile', isLoggedIn, function(req, res) {
        if(!fs.existsSync(__dirname +'/download/' +req.user._id)){
            fs.mkdirSync(__dirname +'/download/' +req.user._id);
            console.log("create");
        }
        fs.readdir(__dirname+'/download/'+req.user._id, function (err, files) {
            if (err) return console.error(err)
			res.writeHead(200, {'Content-Type': 'application/json'});
			var myObj = {
				username: req.user.local.email,
				files: files				
			};
			res.end(JSON.stringify(myObj));
        });
    });





    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);



    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

// process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/mlogin', passport.authenticate('local-login', {
        successRedirect : '/mprofile', // redirect to the secure profile section
          failureRedirect : '/mlogin', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


};




// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function download_file(req,res,fs, now) {
    if(!fs.existsSync(__dirname +'/download/' +req.user._id)){
        fs.mkdirSync(__dirname +'/download/' +req.user._id);
        console.log("create");
    }
    var downloaded_file;
    if (!req.files) {
        res.redirect('/');
        return;
    }
    downloaded_file = req.files.downloaded_file;
    downloaded_file.mv(__dirname +'/download/' + req.user._id +'/'+ time(now) + downloaded_file.name  , function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.redirect('/profile');
        }
    });
}

function time(now){
    return now.getFullYear()+"_"+(now.getMonth()+1)+"_"+now.getDate()+"_"+now.getHours()+"_"+now.getMinutes()+"_"+now.getSeconds()+"_";
}
