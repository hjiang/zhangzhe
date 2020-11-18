require('dotenv').config();

const share = require('./share');

test('parsing with title and more', () => {
  const { title, url, body } = share.parseMsg(
    'sometitle https://www.example.com somemore'
  );
  expect(title).toEqual('sometitle');
  expect(url).toEqual('https://www.example.com');
  expect(body).toEqual('https://www.example.com somemore');
});
