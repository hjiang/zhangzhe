var quiche = require('quiche');
var axios = require('axios');

function makeQR(ctx) {
  var qr = quiche('qr');
  qr.setLabel(ctx.matches[1]);
  qr.setWidth(150);
  qr.setHeight(150);

  var url = qr.getUrl(true);

  ctx.respond({
    text: 'QR Code:',
    attachments: [{
      title: ctx.matches[1],
      color: '#EEEEE',
      images: [{
        url: url,
      }],
    }],
  });
}

function shorten(ctx) {
  axios({
    method: 'post',
    url: 'https://url.leanapp.cn/urls',
    data: {
      origin: ctx.matches[1]
    }
  }).then(function (result) {

    if (!result.data.short) throw new Error('Invalid shorten result: ' + JSON.stringify(result.data));

    var shortURL = 'https://url.leanapp.cn/' + result.data.short;

    var qr = quiche('qr');
    qr.setLabel(shortURL);
    qr.setWidth(150);
    qr.setHeight(150);

    var url = qr.getUrl(true);

    ctx.respond({
      text: shortURL,
      attachments: [{
        title: ctx.matches[1],
        color: '#EEEEE',
        images: [{
          url: url,
        }],
      }],
    });

  }).catch(function (error) {
    ctx.respond('Error: ' + error.message);
  });
}

module.exports = { makeQR, shorten };
