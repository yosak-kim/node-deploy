const express = require('express');
const { isLoggedIn } = require('./middlewares');
const { addFollowing, removeFollowing } = require('../controllers/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, addFollowing);
router.post('/:id/unfollow', isLoggedIn, removeFollowing);

module.exports = router;
