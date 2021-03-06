const CalendarChinese = require('date-chinese');

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function handleVacation(lc, ctx) {
  const dateStr = ctx.matches[1];
  const respond = ctx.respond;
  var query = new lc.Query('Leave');
  var startOfToday =
    dateStr && dateStr.length > 0 ? new Date(dateStr) : new Date();
  if (!isValidDate(startOfToday)) {
    respond(`Invalid date: ${dateStr}`);
    return;
  }
  startOfToday.setHours(0);
  startOfToday.setMinutes(0);
  var endOfToday =
    dateStr && dateStr.length > 0 ? new Date(dateStr) : new Date();
  endOfToday.setHours(23);
  endOfToday.setMinutes(59);

  query.lessThanOrEqualTo('startDate', endOfToday);
  query.greaterThanOrEqualTo('endDate', startOfToday);
  query.find().then(
    results => {
      results = results.filter(result => {
        const endDate = result.get('endDate');
        const endTime = result.get('endTime');
        return endDate > endOfToday || endTime == 'PM';
      });
      const year = startOfToday.getFullYear();
      const month = startOfToday.getMonth() + 1;
      const day = startOfToday.getDate();
      const cal = new CalendarChinese.CalendarChinese();
      cal.fromDate(startOfToday);
      let zzDay = cal.day;
      if (zzDay < 11) {
        zzDay = `初 ${zzDay}`;
      } else {
        zzDay = ` ${zzDay}`;
      }
      const zzYear = year - 1926;
      if (results.length == 0) {
        respond(
          `${year} 年 ${month} 月 ${day} 日（长者 ${zzYear} 年 ${
            cal.month
          } 月${zzDay}）大家都在。Excited!`
        );
      } else {
        var resp = `${year} 年 ${month} 月 ${day} 日（长者 ${zzYear} 年 ${
          cal.month
        } 月${zzDay}）缺席的常委有：\n`;
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
