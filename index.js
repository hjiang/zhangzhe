const role = require('role-model');
const app = role.createRobotApp({
  chatService: 'bearychat',
  chatServiceOptions: {
    team: process.env.BEARYCHAT_TEAM,
    token: process.env.BEARYCHAT_TOKEN
  }
});

app.robot.addHandler(['ping'],
  context => context.respond('pong'));

app.run();
