function handleVacation(lc, ctx) {
  const dateStr = ctx.matches[1];
  const respond = ctx.respond;
  var query = new lc.Query('Leave');
  var startOfToday = dateStr ? new Date(dateStr) : new Date();
  startOfToday.setHours(0);
  startOfToday.setMinutes(0);
  var endOfToday = dateStr ? new Date(dateStr) : new Date();
  endOfToday.setHours(23);
  endOfToday.setMinutes(59);

  query.lessThanOrEqualTo('startDate', endOfToday);
  query.greaterThanOrEqualTo('endDate', startOfToday);
  query.find().then(
    results => {
      results = results.filter(result => {
        var endDate = result.get('endDate');
        var endTime = result.get('endTime');
        return endDate > endOfToday || endTime == 'PM';
      });
      if (results.length == 0) {
        respond('今天大家都在。Excited!');
      } else {
        var resp = '今天缺席的常委有：\n';
        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          resp += (result.get('realName') || result.get('username')) + ': ';
          resp +=
            result.get('startDate').toDateString() +
            ' ' +
            result.get('startTime');
          resp += ' - ';
          resp +=
            result.get('endDate').toDateString() + ' ' + result.get('endTime');
          resp += '\n';
        }
        respond(resp);
      }
    },
    function(error) {
      respond(`查询错误。I am angry!! ${error.code}: ${error.message}`);
    }
  );
}

module.exports = { handleVacation };
