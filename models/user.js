const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      email: {
        type: Sequelize.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'local',
      },
      snsId: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  static associate(db) {
    db.User.hasMany(db.Post);    
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers', // User의 alias. table의 이름이 UserUser가 될 수는 없으니.
      through: 'Follow', // 신설될 관계 테이블의 이름.
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings', 
      through: 'Follow', 
    });
  }
};