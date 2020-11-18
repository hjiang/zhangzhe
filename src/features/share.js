const axios = require('axios').default;
const getUrls = require('get-urls');
const getTitleAtUrl = require('get-title-at-url');

function parseMsg(msg) {
  const urlSet = getUrls(msg, {
    requireSchemeOrWww: true,
    stripAuthentication: false,
    stripWWW: false
  });
  if (urlSet.size === 0) {
    throw new Error('No URL in the message');
  }
  if (urlSet.size > 1) {
    throw new Error('More than one URL in the message');
  }
  const url = urlSet.values().next().value;
  const parts = msg.split(url);
  let title = parts[0].trim();
  let body = parts[1];
  if (!body || body.length === 0) {
    // getUrl probably changed the URL when normalizing it
    body = title;
    title = undefined;
  } else {
    body = (url + body).trim();
  }
  return {
    title,
    url,
    body
  };
}

function discourseApi() {
  return axios.create({
    baseURL: 'https://talk.nextfe.com',
    headers: {
      'Api-Key': process.env.DISCOURSE_API_KEY,
      'Api-Username': process.env.DISCOURSE_API_USER
    }
  });
}

async function createPost(ctx) {
  const msg = ctx.matches[1];
  try {
    let { title, url, body } = parseMsg(msg);
    if (!title || title.length === 0) {
      title = await getTitleAtUrl(url);
    }
    const discourse = discourseApi();
    const res = await discourse.post('/posts.json', {
      title,
      raw: body,
      category: 5
    });
    ctx.respond(`https://talk.nextfe.com/t/topic/${res.data.topic_id}`);
  } catch (e) {
    if (e.response) {
      ctx.respond('Error: ' + e.response.data);
    } else if (e.request) {
      ctx.respond('Unable to send request: ' + e.request);
    } else {
      ctx.respond('Error: ' + e.message);
    }
  }
}

module.exports = { createPost, parseMsg };
