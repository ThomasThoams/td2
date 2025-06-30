// test/api.test.js
const nock = require('nock');
const sinon = require('sinon');
const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised').default;
const sinonChai = require('sinon-chai').default;

chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;
const { fetchUser, createUser } = require('../api');

describe('API Module', () => {
  afterEach(() => {
    sinon.restore();
    nock.cleanAll();
  });

  describe('fetchUser', () => {
    it('should fetch user data successfully (nock)', async () => {
      const userId = 3;
      nock('https://jsonplaceholder.typicode.com')
        .get(`/users/${userId}`)
        .reply(200, { id: userId, name: 'Alice' });

      const data = await fetchUser(userId);
      expect(data).to.deep.equal({ id: 3, name: 'Alice' });
    });

    it('should propagate network errors (nock)', async () => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/users/4')
        .replyWithError('Connection failed');

      await expect(fetchUser(4)).to.be.rejectedWith('Connection failed');
    });

    it('should call the correct URL for userId 10 (sinon stub)', async () => {
      const stub = sinon.stub(axios, 'get').resolves({ data: {} });
      await fetchUser(10);
      expect(stub).to.have.been.calledOnceWith(
        'https://jsonplaceholder.typicode.com/users/10',
        { timeout: undefined }
      );
    });

    it('should apply timeout option', async () => {
      const timeoutError = new Error('timeout of 10ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      sinon.stub(axios, 'get').rejects(timeoutError);

      await expect(fetchUser(5, { timeout: 10 }))
        .to.be.rejectedWith('timeout of 10ms exceeded');
    });

    it('should call axios.get (spy) and return real data', async function() {
      this.timeout(5000);
      const spy = sinon.spy(axios, 'get');

      const user = await fetchUser(1);
      expect(spy).to.have.been.calledOnceWith(
        'https://jsonplaceholder.typicode.com/users/1',
        { timeout: undefined }
      );
      expect(user).to.have.property('id', 1);
    });
  });

  describe('createUser', () => {
    it('should post user data successfully', async () => {
      const newUser = { name: 'Bob' };
      const fakeResponse = { id: 99, name: 'Bob' };
      const stub = sinon.stub(axios, 'post').resolves({ data: fakeResponse });

      const result = await createUser(newUser);
      expect(stub).to.have.been.calledOnceWith(
        'https://jsonplaceholder.typicode.com/users',
        newUser
      );
      expect(result).to.deep.equal(fakeResponse);
    });

    it('should handle post errors', async () => {
      sinon.stub(axios, 'post').rejects(new Error('Post failed'));
      await expect(createUser({})).to.be.rejectedWith('Post failed');
    });
  });
});
