const Sequelize = require('sequelize');

function defineArticle(database) {
    const Article = database.define('article', {
        title: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.TEXT
        },
        isresolve: {
            type: Sequelize.TEXT
        }
    }, {
        getterMethods: {
            excerpt() {
                return this.content.substr(0, 20) + '...';
            }
        }
    });
    Article.associate = ({ User, Comment }) => {
        Article.belongsTo(User);
        Article.hasMany(Comment);
    };
    return Article;
}

module.exports = defineArticle;
