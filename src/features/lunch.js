const shuffleSeed = require('shuffle-seed');
const splitArray = require('split-array');
const startOfWeek = require('date-fns/start_of_week');
const addDays = require('date-fns/add_days');

function handleLunch(lc, respond, seed) {
  const notPartTimeQuery = new lc.Query('_User');
  notPartTimeQuery.notEqualTo('status', 'parttime');
  const notInActiveQuery = new lc.Query('_User');
  notInActiveQuery.notEqualTo('status', 'inactive');
  const inBeijingQuery = new lc.Query('_User');
  inBeijingQuery.equalTo('location', 'beijing');
  const query = lc.Query.and(notPartTimeQuery, notInActiveQuery);
  query.find().then(users => {
    const shuffledUsers = shuffleSeed.shuffle(users, seed);
    const maxGroupSize = Math.ceil(users.length/5);
    const groups = splitArray(shuffledUsers, maxGroupSize);
    let response = '国宴邀请名单：\n';
    groups.forEach((group, i) => {
      const names = group.map(user => user.get('realName'));
      response += `周 ${i}：${names.join('，')}\n`;
    });
    respond(response);
  }).catch(error => {
    respond('查询错误。I am angry!! ' + error.code + ' ' + error.message);
  });
}

function handleLunchThisWeek(lc, respond) {
  handleLunch(lc, respond, startOfWeek(new Date()));
}

function handleLunchNextWeek(lc, respond) {
  handleLunch(lc, respond, startOfWeek(addDays(new Date(), 7)));
}

module.exports = { handleLunch, handleLunchThisWeek, handleLunchNextWeek };
