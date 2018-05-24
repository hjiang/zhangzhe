const role = require('role-model');
const vacation = require('./features/vacation');

const app = role.createRobotApp({
  chatService: 'bearychat',
  chatServiceOptions: {
    team: process.env.BEARYCHAT_TEAM,
    token: process.env.BEARYCHAT_TOKEN
  }
});

const lc = app.leanEngine;
lc.Cloud.useMasterKey();

app.robot.addHandler(['ping'],
  context => context.respond('pong'));

app.robot.addHandler(['vacation'], ctx => {
  vacation.handleVacation(lc, ctx.respond);
});

app.run();
