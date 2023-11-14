const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  res.locals.likerIdList = req.post ? req.user.Liker.map(f => f.id) : [];
  next();
}); //지역변수 설정. 여기서 설정된 지역변수는 템플릿 엔진에서 사용됨

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
}); //nunjucks로 profile page rendering하는 middleware. passport로 isLoggedIn 미들웨어 구현 후, 로그인한 사용자에게만 프로필 페이지를 보여주기위해 미들웨어 붙임

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
}); //nunjucks로 join page rendering하는 middleware. passport로 isNotLoggedIn 미들웨어 구현 후, 로그인 안한 사용자에게만 가입 페이지를 보여주기위해 미들웨어 붙임

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [{ // sequelize의 include는 MySQL의 JOIN에 해당
        model: User,
        attributes: ['id', 'nick'],
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Liker', //똑같이 User를 불러오지만 얘는 좋아요를 불러오는 것
      }],
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
      user:req.user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query}|NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router; // 여기서 export 하기 전에도 res.render에 빨간줄이 쳐지거나 하지 않았다. nunjucks를 require하지 않았음에도...