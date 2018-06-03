const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { Article, Comment, User } = require('../models');

router.get('/', (req, res) => {
    Article
        .findAll({ include: [User] })
        .then((articles) => {
            User
                .findOne({ where: { id:req.user.id}})
                .then((user) => {
                    console.log(req.user),
                    res.render('website/home', { articles, loggedInUser: req.user , user});
                })

        });
});

router.get('/signin', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    res.render('website/signin');
});

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin'
}));

router.get('/signup', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    res.render('website/signup');
});


router.post('/signup', (req, res) => {
    const { fullname, username, password } = req.body;
    bcrypt
        .hash(password, 12)
        .then((hash) => {
            User
                .create({ fullname, username, password: hash, bio:"", role: "user" })
                .then((user) => {
                    if (user.id === 1){
                        user.update({ role:"admin" })
                            .then(() => {
                            req.login(user, () => res.redirect('/'));
                        })


                    }
                    else {
                        req.login(user, () => res.redirect('/'));
                    }

                });
        });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/signin');
});
router.get('/articles/new', (req, res) => {
    res.render('website/articles/new', { loggedInUser: req.user });
});

router.post('/articles/new', (req, res) => {
    const { title, content } = req.body;
    Article
        .create({ title, content, userId: req.user.id, isresolve: "no" })
        .then(() => {
            res.redirect('/');
        });
});

router.get('/articles/article/:articleId', (req, res) => {
    Article
        .findById(req.params.articleId)
        .then((article) => {
            User
                .findOne({ where: { id:req.user.id}})
                .then((user) => {
                    console.log(req.user),
                        res.render('website/articles/article', { article, loggedInUser: req.user , user});
                })

        });
});
router.post('/delete/article/:articleId', (req, res) =>{
    Article
        .findById(req.params.articleId)

        .then((article) => {
            article.destroy({ force: true })
            res.redirect(`/`);
        });
});
router.post('/delete/comment/:commentId', (req, res) =>{
    Comment
        .findById(req.params.commentId)

        .then((comment) => {
            comment.destroy({ force: true })
            res.redirect(`/`);
        });
});

router.get('/edit/comment/:commentId', (req, res) =>{
    Comment
        .findById(req.params.commentId)
        .then((comment) => {
            User
                .findOne({ where: { id:req.user.id}})
                .then((user) => {
                    res.render('website/articles/edit', { comment, user});
                })

        });
});

router.post('/articles/article/:articleId', (req, res) => {
    const { title, content, resolve } = req.body;
    Article
        .update({ title, content, isresolve: resolve }, { where: { id: req.params.articleId } })
        .then(() => {
            res.redirect(`/articles/article/${req.params.articleId}`);
        });
});

router.get('/article/:articleId', (req, res) => {
    Article
        .findById(req.params.articleId, {
            include: [
                User,
                {
                    model: Comment,
                    include: [User]
                }
            ]
        })
        .then((article) => {
            User
                .findOne({ where: { id:req.user.id}})
                .then((user) => {
                    console.log(req.user),
                        res.render('website/article', { article, loggedInUser: req.user , user});
                })

        });
});

router.post('/article/:articleId', (req, res) => {
    const { content } = req.body;
    Comment
        .create({
            content,
            userId: req.user.id,
            articleId: req.params.articleId
        })
        .then(() => {
            res.redirect(`/article/${req.params.articleId}`);
        });
});
router.post('/profile/:userId', (req, res) => {
    const { fName, bio, uName } = req.body;
    User
        .update({ fullname:fName, bio, username:uName }, { where: { id: req.params.userId} })
        .then((user) => {
            res.redirect('/');
        });
});
router.post('/profile/:userId', (req, res) => {
    const { psd } = req.body;
    User
        .update({ password:psd }, { where: { id: req.params.userId} })
        .then((user) => {
            res.redirect('/');
        });
});
router.get('/profile/:userId', (req, res) => {
    User
        .findById(req.params.userId, { include: [Article] })
        .then((user) => {
            res.render('website/profile', { user, loggedInUser: req.user });
        });
});
// router.get('/profile/:userId', (req, res) => {
//     User
//         .findById(req.params.userId, { include: [Article] })
//         .then((user) => {
//             res.render('website/profile', { user, loggedInUser: req.user });
//         });
// });


module.exports = router;
