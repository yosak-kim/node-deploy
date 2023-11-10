const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => { // 로그인한 사용자에게 /join페이지 자체를 안보여주는건 page.js 에서 get방식으로 이미 구현했고, 회원가입 데이터를 보내면 걸러내는 건 여기서 한다.
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) { //이미 존재하는 이메일이면 에러페이지로 리다이렉트
      return res.redirect('/join?error=exist'); // 주소 뒤의 에러를 왜 querystring 형식으로 보내는 거지?
    }
    const hash = await bcrypt.hash(password, 12); //bcrypt의 hash 메서드를 이용한 패스워드 암호화
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error); // 왜 다음 에러 미들웨어로 보내는 것이지?
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => { //authenticate의 콜백함수에서 첫 번째 매개변수가 있다면 실패, 두 번째 매개변수가 있다면 성공이란다. 이런거 f12 눌러서 설명 읽어봐도 나오지도 않는데 어떻게 알지... npm 모듈 공식문서에 적혀있나?
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`); //그런 유저는 없습니다.
    }
    return req.login(user, (loginError) => { //passport가 req에 login과 logout메서드를 자동으로 추가한다. 그리고 여기서 인수인 user는 serializeUser로 넘어간다.
      if (loginError) {
        console.error(loginError);
        return next(loginError); // 왜 계속 authError, loginError 하면서 계속 next로 뒤로 보내는 것이지? export할 때 오류메시지 출력받으라고?
      }
      return res.redirect('/');
    });
  })(req, res, next); //미들웨어 내의 미들웨어에는 (req, res, next)를 붙인단다. 근데 이게 무슨 뜻이지?
});



router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/', // 실패 시 리다이렉트
}), (req, res) => {
  res.redirect('/'); // 성공 시 리다이렉트
});

router.get('/logout', isLoggedIn, (req, res, next) => { //nodejs 20버전 업데이트로 인해 이제 logout()함수가 비동기함수로 바뀌었음.
  try {
    req.logout(() => {
      req.session.destroy();
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;