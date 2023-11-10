const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => { //이거 auth.js 에 있는 그대로인 것 같은데 왜 따로 떼서 파일을 만들어야 하지?
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => { // 세 번째 인수인 done이 ../routes/auth.js 의 passport.authenticate('local', (authError, user, info))의 콜백으로 보내진다. 
    try {
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          done(null, exUser); // 로그인에 성공 시 done의 두 번째 인수에 user의 이메일을 넣어서 보냄. 그래서 비동기로 짜인 것.
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });  //로그인 실패 시 두 번째 인수인 user는 false임. 그래서 비동기로 짜인 것.
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};