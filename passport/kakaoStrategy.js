const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({ //이것도 똑같다. done의 첫째 인수는 에러, 둘째 인수는 회원 이메일
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => { //callbackURL에 적힌 주소로 profile(=user)과 done 말고도 토큰 2개를 보냄. 이것이 KakaoStrategy.
    console.log('kakao profile', profile);
    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });
      if (exUser) {
        done(null, exUser); //그래서 로그인 성공시 첫째 인수가 null이어야 하는 것.
      } else { //회원등록이 안되어있으면 끝이 아니라 가입을 시켜야 함. 그래서 newUser로 create하고 done을 돌려주는 것.
        const newUser = await User.create({
          email: profile._json && profile_json.kakao_account_email,
          nick: profile.displayname,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};