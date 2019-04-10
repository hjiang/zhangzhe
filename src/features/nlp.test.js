require('dotenv').config();

const nlp = require('./nlp');
const lc = require('leancloud-storage');
lc.init(process.env.LC_TEST_APP_ID, process.env.LC_TEST_APP_KEY);

test('trainIntent works', async () => {
  const ctx = {
    matches: ['', '你还好吗', 'ask.ok'],
    respond: jest.fn(() => {})
  };
  await nlp.handleTrainIntent(lc, ctx);
  expect(ctx.respond.mock.calls.length).toBe(1);
});

test('addAnswer works', async () => {
  const ctx = {
    matches: ['', 'ask.ok', '当然啦'],
    respond: jest.fn(() => {})
  };
  await nlp.handleAddAnswer(lc, ctx);
  expect(ctx.respond.mock.calls.length).toBe(1);
});

test('genAnswer works', async () => {
  const ctx = {
    matches: ['你还好吗？', ''],
    respond: jest.fn(() => {})
  };
  await nlp.genAnswer(lc, ctx);
  expect(ctx.respond.mock.calls.length).toBe(1);
});
