const { NlpManager } = require('node-nlp');

async function initManager(lc) {
  const manager = new NlpManager({ languages: ['zh', 'en'] });
  var query = new lc.Query('ZhangZheNLPModel');
  try {
    var result = await query.first();
    manager.import(result.get('data'));
  } catch(e) {
    console.error('Failed read existing model. Maybe this is the first run?');
  }
  return manager;
}

async function exportModel(lc, manager) {
  const query = new lc.Query('ZhangZheNLPModel');
  var model = null;
  try {
    model = await query.first();
  } catch(e) {
    console.error('Failed read existing model. Maybe this is the first run?');
    const Model = new lc.Object.extend('ZhangZheNLPModel');
    model = new Model();
  }
  model.set('data', manager.export(true));
  await model.save();
}

async function handleTrainIntent(lc, ctx) {
  const manager = initManager(lc);
  const sentence = ctx.matches[1];
  const intent = ctx.matches[2];
  manager.addDocument('zh', sentence, intent);
  await manager.train();
  await exportModel(lc, manager);
  ctx.respond('学习了一个');
}

module.exports = {handleTrainIntent};
