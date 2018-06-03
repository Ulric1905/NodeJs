const Sequelize = require('sequelize');

function defineUser(database) {
    const User = database.define('user', {
        fullname: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        bio: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        }
    });
    User.associate = ({ Article, Comment }) => {
        User.hasMany(Article);
        User.hasMany(Comment);
    };
    return User;
}

module.exports = defineUser;
