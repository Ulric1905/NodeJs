const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require('sequelize');

// This secret will be used to sign and encrypt cookies
const COOKIE_SECRET = 'cookie secret';

passport.use(new LocalStrategy((email, password, callback)=> {
    Log
    .findOne({ where: { email, password }})
    .then((user)=> {
    if (user){
        callback(null, user);
    }else {
        callback(null,false, {
    message: 'Invalid credentials'
});
}
})
.catch(callback);
}));

// Save the user's email address in the cookie
passport.serializeUser((user, cb) => {
    cb(null, user.email);
});

passport.deserializeUser((email, callback) => {
    Log
    .findOne({ where: { email }})
    .then((user)=> {
    if (user){
        callback(null, user);
    }else {
        callback(null,false, {
    message: 'Invalid credentials'
});
}
})
.catch(callback);
});

// Create an Express application
const app = express();

// Use Pug for the views
app.set('view engine', 'pug');

// Parse cookies so they're attached to the request as
// request.cookies
app.use(cookieParser(COOKIE_SECRET));

// Parse form data content so it's available as an object through
// request.body
app.use(bodyParser.urlencoded({ extended: true }));

// Keep track of user sessions
app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize passport, it must come after Express' session() middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    // Render the login page
    res.render('login');
});

app.post('/login',
    // Authenticate user when the login form is submitted
    passport.authenticate('local', {
        // If authentication succeeded, redirect to the home page
        successRedirect: '/',
        // If authentication failed, redirect to the login page
        failureRedirect: '/login'
    })
);

const db = new Sequelize('blog', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const Game = db.define('game', {
    title: { type: Sequelize.STRING },
    desc: { type: Sequelize.TEXT },
    ratio: { type: Sequelize.TINYINT }

});

const Log = db.define('log', {
    email: { type: Sequelize.TEXT },
    password: { type: Sequelize.TEXT }
});
app.get('/', (req, res) => {
    Game
    .findAll()
    .then((games) => {
    res.render('homepage', { games, user:req.user });
});
});

app.post('/', (req, res) => {
    const { title, desc } = req.body;
Game
    .sync()
    .then(() => Game.create({ title, desc, ratio:0}))
.then(() => res.redirect('/'));
});
app.get('/inscription', (req, res) => {
    res.render('inscription');
});
app.post('/rankup/:gameid', (req, res) => {
    Game.findOne({ where: { id:req.params.gameid }})
    .then((games) => {
        var ratio = games.ratio;
        games.update(
            {ratio: db.literal('ratio + 1'),})
        res.redirect('/');
    })
})
app.post('/rankdown/:gameid', (req, res) => {
    Game.findOne({ where: { id:req.params.gameid }})
    .then((games) => {
    var ratio = games.ratio;
    games.update(
    {ratio: db.literal('ratio - 1'),})
    res.redirect('/');

})
})

app.post('/inscription', (req, res) => {
    Log.create({email: req.body.username, password: req.body.password})
    .then((log) => {
    req.login(log, ()=>{
    res.redirect('/')
})
})
});

// req+param

db.sync();

app.listen(3000, () => {
    console.log('Listening on port 3000');
});