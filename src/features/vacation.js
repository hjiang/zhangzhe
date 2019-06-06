const CalendarChinese = require('date-chinese');

function handleVacation(lc, ctx) {
  const dateStr = ctx.matches[1];
  const respond = ctx.respond;
  console.log(`Date: ${dateStr}`);
  var query = new lc.Query('Leave');
  var startOfToday =
    dateStr && dateStr.length > 0 ? new Date(dateStr) : new Date();
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
      console.log('found');
      results = results.filter(result => {
        const endDate = result.get('endDate');
        const endTime = result.get('endTime');
        return endDate > endOfToday || endTime == 'PM';
      });
      console.log('calculating date');
      const year = startOfToday.getFullYear();
      const month = startOfToday.getMonth() + 1;
      const day = startOfToday.getDate();
      console.log('calculating chinese date');
      const cal = new CalendarChinese.CalendarChinese();
      cal.fromDate(startOfToday);
      let zzDay = cal.day;
      if (zzDay < 10) {
        zzDay = `初 ${zzDay}`;
      } else {
        zzDay = ` ${zzDay}`;
      }
      const zzYear = year - 1926;
      console.log('calculated');
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
