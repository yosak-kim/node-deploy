jest.mock('../models/user');
const User = require('../models/user');
const { addFollowing, removeFollowing } = require('./user');


//req와 res에 필요한 요소가 뭔지 정확히 알고 있어야만 테스트 코드를 짤 수가 있겠다. 
//필요한 요소를 옵션형식으로 넣어주고 나머지 메소드는 걍 jest.fn()으로 전부 퉁친다.
//비동기함수는 아래 test처럼 씀
//필요한 요소와 메소드를 전부 선언하고, expect와 toBeCalledWith로 예상값을 적으면 됨. 다르게 나오면 에러가 뜸

describe('addFollowing', () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  }
  const next = jest.fn();

  test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함', async () => {
    User.findOne.mockReturnValue(Promise.resolve({
      addFollowing(id) {
        return Promise.resolve(true);
      }
    })); //User 모델도 모킹한 것. 뭔가 찾은 케이스를 시뮬레이션하는 것이니 무조건 true만 뜨도록 만들음. 왜 프로미스여야 하지? 이해 안 되니까 걍 외우자.

    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith('success');
  });
  test('사용자를 못 찾으면 res.status(404).send(no user)를 호출', async () => {
    User.findOne.mockReturnValue(null); //User 모델을 모킹했는데, 못 찾는 케이스니까 null을 돌려줘야 실제와 같은 환경이 된다.
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith('no user');
  });
  test('DB에서 에러가 발생하면 next(error) 호출함', async () => {
    const error = '테스트용 에러';
    User.findOne.mockReturnValue(Promise.reject(error)); // 에러 떴을때를 시뮬레이션하는 것이므로 resolve대신 reject를 씀.
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });

});


describe('removeFollowing', () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  }
  const next = jest.fn();

  test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함', async () => {
    User.findOne.mockReturnValue(Promise.resolve({
      removeFollowing(id) {
        return Promise.resolve(true);
      }
    })); //User 모델도 모킹한 것. 뭔가 찾은 케이스를 시뮬레이션하는 것이니 무조건 true만 뜨도록 만들음. 왜 프로미스여야 하지? 이해 안 되니까 걍 외우자.

    await removeFollowing(req, res, next);
    expect(res.send).toBeCalledWith('success');
  });
  test('사용자를 못 찾으면 res.status(404).send(no user)를 호출', async () => {
    User.findOne.mockReturnValue(null); //User 모델을 모킹했는데, 못 찾는 케이스니까 null을 돌려줘야 실제와 같은 환경이 된다.
    await removeFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith('no user');
  });
  test('DB에서 에러가 발생하면 next(error) 호출함', async () => {
    const error = '테스트용 에러';
    User.findOne.mockReturnValue(Promise.reject(error)); // 에러 떴을때를 시뮬레이션하는 것이므로 resolve대신 reject를 씀.
    await removeFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });

});