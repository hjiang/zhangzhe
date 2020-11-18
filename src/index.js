require('dotenv').config();

const role = require('role-model');
const vacation = require('./features/vacation');
const urlShortener = require('./features/url-shortener');
const nlp = require('./features/nlp');
const share = require('./features/share');

const app = role.createRobotApp({
  chatService: 'zulip',
  chatServiceOptions: {}
});

const lc = app.leanEngine;
lc.Cloud.useMasterKey();

app.robot.addHandler(/\s*vacation\s*(\S*)/, ctx => {
  vacation.handleVacation(lc, ctx);
});

app.robot.addHandler(/qr (https*:\/\/.*)/, ctx => {
  urlShortener.makeQR(ctx);
});

app.robot.addHandler(/shorten (https*:\/\/.*)/, ctx => {
  urlShortener.shorten(ctx);
});

app.robot.addHandler(/trainIntent (.*)=>(.*)/, ctx => {
  nlp.handleTrainIntent(lc, ctx);
});

app.robot.addHandler(/addAnswer (.*)=>(.*)/, ctx => {
  nlp.handleAddAnswer(lc, ctx);
});

app.robot.addHandler(/\s*share \s*(.*)/, ctx => {
  share.createPost(ctx);
});

app.robot.addHandler(/(.*)/, ctx => {
  nlp.genAnswer(lc, ctx);
});

app.run();
