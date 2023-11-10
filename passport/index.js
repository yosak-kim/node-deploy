const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  
    passport.deserializeUser( (id, done) => {
      User.findOne({
        where: { id },
        include: [{ //팔로워와 팔로잉목록을 JOIN해서 갖고 옴.
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followers',
        }, {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followings',
        }],
      })
        .then(user => done(null, user))
        .catch(err => done(err));
    });
    

  
  local();
  kakao();

};