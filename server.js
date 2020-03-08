var http = require("http");

function start(route, handle) {
  function onRequest(request, response) {
    route(handle, response, request);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;