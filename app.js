const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis').default;

dotenv.config();
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch(console.error);
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');

const app = express(); //익스프레스 객체 app으로 불러옴
passportConfig(); //패스포트 설정
app.set('port', process.env.PORT || 8001); //포트 설정
app.set('view engine', 'html'); //넌적스 세팅
nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false }) // sequelize로 만든 DB 연결
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // body-parser
app.use(express.urlencoded({ extended: false })); //body-parser
app.use(cookieParser(process.env.COOKIE_SECRET)); //cookie-parser

const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
};

if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure=true; 이것은 https일 때만 적용한다.
}
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.error(error.message);
  next(error);
}); //이 미들웨어의 역할이 뭐지? 그냥 에러 담당이면 에러담당 미들웨어에 다 써도 되는 내용 아님?

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};// 배포용이면 스택트레이스 에러메시지 표시하지 마라. 보안에 좋지 않다.
  res.status(err.status || 500);
  res.render('error'); // 에러메시지 nunjucks로 만든거 

});


module.exports = app;