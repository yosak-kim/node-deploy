//데이터베이스에 대한 테스트코드는 이렇게 만든다.

const Sequelize = require('sequelize');
const User = require('./user');
const config = require('../config/config')['test'];
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);
// ./models/index.js처럼 config을 불러온다.

describe('User 모델', () => {
  test('static init 메소드 호출', () => {
    expect(User.init(sequelize)).toBe(User); //처음 보는 메소드들 천지다. 주로 to로 시작하는 것들로, toBe나 toHaveBeenCalled나 뭐 그런 것들. 공식문서를 봐야겠다.
  });
  test('static associate 메서드 호출', () => {
    const db = {
      User: {
        hasMany: jest.fn(),
        belongsToMany: jest.fn(),

      },
      Post: {},
    };
    User.associate(db);
    expect(db.User.hasMany).toHaveBeenCalledWith(db.Post);
    expect(db.User.belongsToMany).toHaveBeenCalledTimes(2);
  });
});