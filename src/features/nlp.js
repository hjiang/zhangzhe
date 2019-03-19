const { NlpManager, Language } = require('node-nlp');
const { handleVacation } = require('./vacation');

async function initManager(lc) {
  const manager = new NlpManager({ languages: ['zh', 'en'] });
  var query = new lc.Query('ZhangZheNLPModel');
  try {
    var result = await query.first();
    manager.import(result.get('data'));
  } catch (e) {
    console.error('Failed read existing model. Maybe this is the first run?');
  }
  return manager;
}

async function exportModel(lc, manager) {
  const query = new lc.Query('ZhangZheNLPModel');
  var model = null;
  try {
    model = await query.first();
  } catch (e) {
    console.error('Failed read existing model. Maybe this is the first run?');
    const Model = new lc.Object.extend('ZhangZheNLPModel');
    model = new Model();
  }
  model.set('data', manager.export(true));
  await model.save();
}

function guessLanguage(s) {
  const language = new Language();
  return language.guessBest(s, ['zh', 'en']).alpha2;
}

async function handleTrainIntent(lc, ctx) {
  const manager = await initManager(lc);
  const sentence = ctx.matches[1].trim();
  const intent = ctx.matches[2].trim();
  const lang = guessLanguage(sentence);
  manager.addDocument(lang, sentence, intent);
  await manager.train();
  await exportModel(lc, manager);
  ctx.respond('学习了一个');
}

async function handleAddAnswer(lc, ctx) {
  const manager = await initManager(lc);
  const intent = ctx.matches[1].trim();
  const answer = ctx.matches[2].trim();
  const lang = guessLanguage(answer);
  manager.addAnswer(lang, intent, answer);
  await manager.train();
  await exportModel(lc, manager);
  ctx.respond('学习了一个');
}

async function genAnswer(lc, ctx) {
  const manager = await initManager(lc);
  const result = await manager.process(ctx.matches[0].trim());
  if (result.intent === 'ask.vacation') {
    handleVacation(lc, ctx.respond);
  } else {
    const answer =
      result.score > 0.6 && result.answer
        ? result.answer
        : '我对不起，无可奉告。';
    ctx.respond(answer);
  }
}

module.exports = { handleTrainIntent, handleAddAnswer, genAnswer };
