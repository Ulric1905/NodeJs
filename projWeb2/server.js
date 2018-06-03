const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { database, User } = require('./models');
const routes = require('./routes');

passport.use(new LocalStrategy((username, password, callback)   => {
    User
        .findOne({ where: { username:username }})
        .then((user) => {
            if (!user) {
                return callback(null, false, {
                    message: `No user account found for "${username}"`
                });
            }

            bcrypt.compare(password, user.password, (isValid) => {
                if (isValid) {
                    return callback(null, false, {
                        message: 'Incorrect password'
                    });
                }

                callback(null, user);
            });
        });
}));
passport.serializeUser((user, callback) => {
    callback(null, user.id);
});
passport.deserializeUser((id, callback) => {
    User
        .findById(id)
        .then((user) => {
            callback(null, user);
        })
        .catch(callback);
});

const COOKIE_SECRET = '5h*qy0qm5#89Mzjh';
const app = express();

app.set('view engine', 'pug');
app.use(cookieParser(COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: COOKIE_SECRET, resave: false, saveUninitialized: false }));
app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

database.sync().then(() => {
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});
