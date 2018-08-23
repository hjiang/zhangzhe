const role = require('role-model');
const vacation = require('./features/vacation');
const lunch = require('./features/lunch');
const urlShortener = require('./features/url-shortener');

const app = role.createRobotApp({
  chatService: 'zulip',
  chatServiceOptions: {}
});

const lc = app.leanEngine;
lc.Cloud.useMasterKey();

app.robot.addHandler(['ping'],
  ctx => ctx.respond('pong'));

app.robot.addHandler(['vacation'], ctx => {
  vacation.handleVacation(lc, ctx.respond);
});

app.robot.addHandler(['本周国宴'], ctx => {
  lunch.handleLunchThisWeek(lc, ctx.respond);
});

app.robot.addHandler(['下周国宴'], ctx => {
  lunch.handleLunchNextWeek(lc, ctx.respond);
});

app.robot.addHandler(/qr (https*:\/\/.*)/, ctx => {
  urlShortener.makeQR(ctx);
});

app.robot.addHandler(/shorten (https*:\/\/.*)/, ctx => {
  urlShortener.shorten(ctx);
});

app.run();
