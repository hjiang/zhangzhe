const role = require('role-model');
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
  var query = new lc.Query('Leave');
  var startOfToday = new Date();
  startOfToday.setHours(0);
  startOfToday.setMinutes(0);
  var endOfToday = new Date();
  endOfToday.setHours(23);
  endOfToday.setMinutes(59);

  query.lessThanOrEqualTo('startDate', endOfToday);
  query.greaterThanOrEqualTo('endDate', startOfToday);
  query.find().then(results => {
    results = results.filter(result => {
      var endDate = result.get('endDate');
      var endTime = result.get('endTime');
      return endDate > endOfToday || endTime == 'PM';
    });
    if (results.length == 0) {
      ctx.respond('今天大家都在。Excited!');
    } else {
      var resp = '今天缺席的常委有：\n';
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        resp += (result.get('realName') || result.get('username')) + ': ';
        resp += result.get('startDate').toDateString() + ' ' +
          result.get('startTime');
        resp += ' - ';
        resp += result.get('endDate').toDateString() + ' ' + result.get('endTime');
        resp += '\n';
      }
      ctx.respond(resp);
    }
  }, function (error) {
    ctx.respond('查询错误。I am angry!! ' + error.code + ' ' + error.message);
  });
});

app.run();
