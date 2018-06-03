
const router = require('express').Router();
const { Article, User } = require('../models');

router.get('/articles/new', (req, res) => {
    res.render('admin/articles/new', { loggedInUser: req.user });
});

router.post('/articles/new', (req, res) => {
    const { title, content } = req.body;
    Article
        .create({ title, content, userId: req.user.id, isresolve: "no" })
        .then(() => {
            res.redirect('/');
        });
});

router.get('/articles/:articleId', (req, res) => {
    Article
        .findById(req.params.articleId)
        .then((article) => {
            res.render('admin/articles/article', { article, loggedInUser: req.user });
        });
});

router.get('/user/editUser', (req, res) => {
    User
        .findAll()
        .then((users) => {
            console.log(users);
            res.render('admin/user/editUser', {users} );
        })
})
router.post('/articles/:articleId', (req, res) => {
    const { title, content, resolve } = req.body;
    Article
        .update({ title, content, isresolve: resolve }, { where: { id: req.params.articleId } })
        .then(() => {
            res.redirect(`/articles/${req.params.articleId}`);
        });
});
router.post('/user/changeUser/:userId', (req, res) => {
    const { fName, uName, bio, role } = req.body;
    User
        .update({ fName, uName, bio,  role }, { where: { id: req.params.userId } })
        .then(() => {
            res.redirect('/admin/user/editUser');
        });
});

module.exports = router;
