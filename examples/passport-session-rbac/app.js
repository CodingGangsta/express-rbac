var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var authorization = require("express-rbac");

// Initialize our store
var Store = require("./lib/store");
var store = new Store();

// Express setup
var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// Express session setup.
app.use(session({
  key: "RbacPassportTest",
  secret: "4378r4hjnjhfgrbwqhjfhoyf2jnrbhweyurf23njk4hu23y84i23r2wesdg32rt3566t7ew8oiljgsjdbghiwu4o3jt34ugi23fwvf",
  resave: true,
  saveUninitialized: true
  })
);

// Connect-flash setup
app.use(flash());

// Express views setup using jade/ pug view engine.
app.set("views", "views");
app.set("view engine", "pug");

// Passport Local Strategy implementation, including the user validation.
// We are using mocked data inside our store, and a simple email equality check.
// Remember this is as simple as it can be for DEMO purposes.
// On a true application, you should be checking against a password and it should be stored using some kind of hashing/ encryption.
passport.use(new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    // IMPORTANT: This is a DEMO project, so by no means use this kind of user validation for a real application.
    return store.userLogIn(username)
    .then(function(user) {
      done(null, user);
    }).catch(function(error) {
      done(null, false);
    });
  })
);

// Passport function for serializing user data for session.
// We only keep user id in session, the rest is loaded per request.
// This strategy can be poor in performance, specially on SPA and API's, as they usually create lots of request per page load.
// Be careful when using it on production apps.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Passport function for deserializing user data from session
// We store only the user id in session, when a new request is started, we reload the user by its id.
passport.deserializeUser(function(id, done) {
  return store.userGet(id)
  .then(function(user) {
    done(null, user);
  }).catch(function(error){
    done(error);
  });
});

// Register passport
app.use(passport.initialize());
// Register passport session for keeping user data(only the serialized one!) on session.
app.use(passport.session());

// Register our Express-rbac middleware for authorization
// IMPORTANT: You can also register the middleware after the authenticated path, and in that scenario, 
// you will (or could actually) avoid the authentication check inside the callback!
// --> if(!req.isAuthenticated()) {
app.use(authorization.authorize(
  {
    // Extend passport generated user property(req.user), so we keep consistency!
    bindToProperty: "user"
  }, function(req, done) {
    // This is a Passport generated method, so you won't have it if you are using any other type of authentication.
    // However the basics are the same, you should validate if the user is authenticated:
    // If the user is still not authenticated, call done callback function sending false as the parameter, 
    // this way the middleware won't add the authorization extension methods. 
    // If the user is already authenticated, get its roles and/ or permissions from wherever you have them 
    // (here they are already on the req.user object!) and call done callback function with them.
    // IMPORTANT: If an error is thrown here, it will be catched and the error middleware will be called using
    // express standard pipeline -> next(error).
    if(!req.isAuthenticated()) {
      // If we are not on an authenticated request, we can call done(false) to supress roles & permissions.
      done(false);
    } else {
      // If we are on an authenticated request, we can extract roles and/ or permissions, which in this particular case 
      // come from passport req.user object and use them to call done(authData).
      var authData = {roles: [], permissions: []};
      authData.roles = req.user.roles.map(function(r) {
        return r.name;
      });
      authData.permissions = req.user.permissions.map(function(p) {
        return p.name;
      });
      done(authData);
    }
  }
));

// Login view GET(Initial page rendering)
app.get("/login", function(req, res) {
  res.render("login", {
    errorMessage: req.flash("loginMessage")[0] || null
  });
});

// Login view POST(username + password) received.
// Set up with passport authenticate handler for our already registered local-strategy.
app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

// Logout view.
// use logout() function added by passport.
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
  return null;
});

// From here onwards, only authenticated users can continue. The rest will be redirected to /login
app.get("/*", function(req, res, next) {
  // Redirect Unauthenticated users.
  if (!req.isAuthenticated()) {
      res.redirect("/login");
      return null;
  }
  return next();
});

// Index view, redirect users
app.get("/", function(req, res) {
  // Render index view for authenticated users.
  res.render("index", {
    user: req.user,
    roleChecks: [
      {test: "req.user.isInRole('User')", result: req.user.isInRole("User")},
      {test: "req.user.isInRole(['Content Admin','Auditor'])", result: req.user.isInRole(["Content Admin","Auditor"])},
      {test: "req.user.isInAnyRole('Content Admin')", result: req.user.isInAnyRole("Content Admin")},
      {test: "req.user.isInAnyRole(['Audit Manager', 'Developer'])", result: req.user.isInAnyRole(["Audit Manager", "Developer"])}
    ],
    permissionChecks: [
      {test: "req.user.hasPermission('canAddUser')", result: req.user.hasPermission('canAddUser')},
      {test: "req.user.hasPermission(['canViewReports', 'canDeleteUser'])", result: req.user.hasPermission(['canViewReports', 'canDeleteUser'])},
      {test: "req.user.hasAnyPermission('canAuditPeople')", result: req.user.hasAnyPermission('canAuditPeople')},
      {test: "req.user.hasAnyPermission(['canViewReports', 'canDeleteUser'])", result: req.user.hasAnyPermission(['canViewReports', 'canDeleteUser'])},
    ]
  });
});

// Check middleware for authorization and render if succeeds.
app.get("/page1", authorization.isInRole("User"), function(req, res) {
  // Render page1.
  res.render("page1");
});

// Check middleware for authorization and render if succeeds.
app.get("/page2", authorization.isInAnyRole(["Audit Manager", "Content Admin"]), function(req, res) {
  // Render page2.
  res.render("page2");
});

// Check middleware for authorization and render if succeeds.
app.get("/page3", authorization.hasPermission("canViewReports"), function(req, res) {
  // Render page3.
  res.render("page3");
});

// Check middleware for authorization and render if succeeds.
app.get("/page4", authorization.hasAnyPermission(["canDeleteUser", "canAddReports"]), function(req, res) {
  // Render page4.
  res.render("page4");
});

// Handle errors
app.use(function(error, req, res, next) {
  if(error.status && error.status === 403) {
    return res.render("403");
  }
  res.render("error", {
    error: error
  });
});

// Register our app to listen on port 3500 
app.listen(3500, function() {
  console.log("Express-rbac + passport + session example app listening on port 3500");
});
