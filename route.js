// route.js
url = require("url");

function route(handle, response, request) {
  var pathname = url.parse(request.url).pathname;
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route