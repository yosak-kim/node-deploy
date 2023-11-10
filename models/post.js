const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',

    });
  }
  static associate(db) {
    db.Post.belongsTo(db.User); //User table과 N:1관계
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' }); //Hashtable 과 N:M관계. PostHashtag는 신설될 관계 테이블의 명칭이다.

  }
};