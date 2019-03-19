const nlp = require('./nlp');
const lc = require('leancloud-storage');
lc.init(process.env.LC_TEST_APP_ID, process.env.LC_TEST_APP_KEY);

test('trainIntent works', async () => {
  const ctx = {
    matches: ['', '一个测试', 'ask.ok'],
    respond: jest.fn(() => {})
  };
  await nlp.handleTrainIntent(lc, ctx);
  expect(ctx.respond.mock.calls.length).toBe(1);
});
