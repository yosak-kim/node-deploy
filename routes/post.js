const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { //파일을 업로드하지 않으면서도 멀티파트 형식으로 업로드하려면 none()메소드를 사용한단다.
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s$]+/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({ // 데이터베이스 Hashtag 테이블에서 있으면 가져오고 없으면 만들어서 가져오는 메소드가 findOrCreate다. 
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0])); //[모델, 생성 여부] 가 반환형이므로 result.map(r=>r[0])을 가져오면 됨. addHashtag로 게시글과 연결.
      //addHashtags라는 메서드를 정의한 적이 없는데 어떻게 쓰고 있냐고?? 이거 엄청 궁금했는데, sequelize에서는 모델(테이블)의 이름 앞에 get,set,add,remove등의 동사를 붙여서 메서드를 만들 수 있다. 
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:postId/delete', isLoggedIn, async (req, res, next) => {
  try {
    console.log(req.params.postId);
    await Post.destroy({ where: { id: req.params.postId } }); 
    res.send('success');

  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:postId/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    await post.addLiker(req.user.id); // 여기에는 as 이름으로 한다
    res.send('ok');
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/:postId/unlike', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    await post.removeLiker(req.user.id);
    res.send('ok');
  } catch (error) {
    console.log(error);
    next(error);
  }
});



module.exports = router;