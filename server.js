var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
/*var leveldown = require('leveldown')
*/var levelup = require('levelup')
var db = require('./db');
var dbUsers= levelup('./dbUsers')
var bodyParser = require('body-parser')
var serveStatic= require('serve-static')
var serve = serveStatic('public')
var collect = require('collect-stream')

//var body = require('body/any')

/*app.use(express.bodyParser())
app.use(express.bodyParser({
  extended:true
}))
app.use(express.json())
app.use(express.urlencoded())*/

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    dbUsers.get(username, function(err,value){
      if (err) {
        console.log('uhohhhh it aint workin')
        return cb(null,false, {message:'Incorrect Username.'})
      }
      else {
        if (value.password === password){
          return cb(null, value)
        }
        else {
          return cb(null,false,{message:'Incorrect Password'})
        }
      }
    })

    /*db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false, {message:'Incorrect username'}); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });*/
  }
));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());



app.get('/checkDb', function(req,res){
  console.log('yuppp')
  var stream = dbUsers.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type':'application/JSON'})
    res.end(JSON.stringify(data))
  })
  
})
// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    var message = ''

    res.render('login', {message:message});
  }
)

function test () {
  console.log('wait one second!')
}

app.get('/login.html', function(req,res){
  test()
  serve(req,res)
})

app.get('/signUp', function (req,res){
  res.render('signUp')
})

app.post('/signUp', function(req,res){
  console.log('ohhhhh!')
/*  body(req,res,function(err,params){
*/  
  console.log('doinnnn something')
  var username= req.body.username
  console.log('worked', username)
  var body = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  }
  dbUsers.put(username, body, function(err){
    if(err){console.log(err)}
  })
  res.render('login', {
      message:' '
  });
/*  })
*/
})
  
app.get('/loginAgain', function(req, res){
    var message = 'Login Failed, Try Again...'
    res.render('login', {
      message:message
    });
  });

console.log('server listening on port 3000')

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/loginAgain' }),
  function(req, res) {
    console.log('realllllly')

    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);
app.use(express.static('public'))
