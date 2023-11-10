const app=require('./app');

//테스트를 위해 app을 객체로 만들고 server에서 불러와서 listen함.
//만약 나중에 오류가 발생한다면, 이것을 그대로 app.js로 다시 옮기면 된다.
//그땐 package.json의 start 명령어도 nodemon server에서 nodemon app으로 다시 바꿔준다.
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중.');
});