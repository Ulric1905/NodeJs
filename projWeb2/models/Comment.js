const Sequelize = require('sequelize');

function defineComment(database) {
    const Comment = database.define('comment', {
        content: {
            type: Sequelize.TEXT
        }
    });
    Comment.associate = ({ Article, User }) => {
        Comment.belongsTo(Article);
        Comment.belongsTo(User);
    };
    return Comment;
}

module.exports = defineComment;
