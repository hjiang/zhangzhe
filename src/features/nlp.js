const { NlpManager, Language } = require('node-nlp');
const { handleVacation } = require('./vacation');
const axios = require('axios');

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
  const input = ctx.matches[0].trim();
  const result = await manager.process(input);
  if (result.intent === 'ask.vacation') {
    handleVacation(lc, { respond: ctx.respond });
  } else {
    let answer = '我对不起，无可奉告。';
    if (result.score > 0.6 && result.answer) {
      answer = result.answer;
    } else {
      const externalAnswer = await externalRobotAnswer(input);
      if (externalAnswer) {
        answer = externalAnswer;
      }
    }
    ctx.respond(answer);
  }
}

async function externalRobotAnswer(textInput) {
  const apiKey = process.env.EXTERNAL_BOT_API_KEY;
  const result = await axios({
    method: 'post',
    url: 'http://openapi.tuling123.com/openapi/api/v2',
    data: {
      reqType: 0,
      perception: {
        inputText: {
          text: textInput
        }
      },
      userInfo: {
        apiKey: apiKey,
        userId: Math.random()
          .toString(36)
          .substring(2, 15)
      }
    }
  });
  if (result.data.results && result.data.results.length > 0) {
    const firstTextResult = result.data.results.find(r => r.values.text);
    if (firstTextResult) {
      return firstTextResult.values.text;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

module.exports = { handleTrainIntent, handleAddAnswer, genAnswer };
