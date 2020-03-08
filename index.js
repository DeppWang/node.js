var server = require("./server");
var route = require("./route");
var requestHandlers = require("./requestHandlers");

handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;

server.start(route.route, handle);
