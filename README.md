## 事件驱动与回调与函数传递

```js
axios.get(imageUrl)
  .then(function(response){
    console.log(response)})
  })
return x;
```

- 函数传递：function(response){} 是一个匿名函数，作为一个参数，传递给了 then()，response 是一个参数。该函数是回调函数。
- 回调（异步）：先执行 return，返回 response 需要时间，是异步的，待 response 返回时，执行回调函数
- 事件驱动：返回 response 就是一个事件，then 可实现调用回调函数

```js
// server.js
var http = require("http");

function onRequest(request, response) {
  console.log('Request received.')'
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}

http.createServer(onRequest).listen(8888);

console.log('Server has started.');
```

- 函数传递：将函数 onRequest 作为一个参数，传递给 createServer()
- 回调：待监听端口有访问，会传递两个参数，执行传递的函数
- 事件驱动：监听端口有访问是一个事件，传递的函数是为事件提前设置的反应

## 事件轮询

在node中除了代码，所有一切都是并行执行的*

##  Node 入门教程笔记

https://www.nodebeginner.org/index-zh-cn.html#responding-request-handlers-with-non-blocking-operations

- （请求）路由（模块）：分发请求
- 请求处理程序：处理请求
- 服务模块：接受请求

```
index.js
  server.js
  route.js
  requestHandlers.js
```

服务模块+路由

```js
// index.js
var server = require("server");
var reoute = require("route");

server.start(route.route); 
```

```js
// server.js
function start(route){
  funtion http.createServer(function(request,reponse){
    route();
    reponse.writeHead(200, {"Content-Type":"text/plain"});
    reponse.write("Hello World");
    reponse.end();
  }).listen(8888);
}
```

```js
// route.js
function route(){
   console.log('route')
}

exports.route = route
```

请求处理模块

```js
// requestHandlers.js
function start(){
  console.log("start");
}

function upload(){
  console.log("upload");
}

exports.start = start
exports.upload = upload
```

如何关联路由模块和请求处理程序：如何将路由模块的方法和请求处理程序的方法一一对应？

- 使用一个对象 handle 用键值对对应

```js
// index.js
var server = require("./server");
var route = require("./route");
var requestHandlers = require("./requestHandlers");

handle = {};
handle["/"] = requestHandlers.start; // 没有括号
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;

server.start(route.route, handle);
```

```js
// server.js
var http = require("http");
var url = require("url");

function start(route, handle) {
  http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var content = route(handle, pathname);
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write(content);
    response.end();
  }).listen(8888);

  console.log("Server has started.");
}
                            
exports.start = start;
```

```js
// route.js
function route (handle,pathname) {
  if (typeof handle[pathname] === 'function') {
    return handle[pathname]();
  } else {
    return "404 Not found";
  }
}

exports.route = route
```

疑问：

- 此处如何将 request 数据 和 response  传递给 requestHandlers()

传递 response 给 requestHandlers()

```js
// server.js
var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
```

```js
// route.js
function route(handle, pathname, response) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response);
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route
```

```js
// requestHandlers.js
var exec = require("child_process").exec; // 连接线是下划线，exec不跟()

function start(response) {
  console.log("Request handler 'start' was called.");
  exec("find /",
    { timeout: 10000, maxBuffer: 20000 * 1024 },
    function (error, stdout, stderr) {
      console.log(stdout);
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.write(stdout);
      response.end();
    });
  console.log("start");
}

function upload(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("Hello Upload");
  response.end();
}


exports.start = start
exports.upload = upload
```

接收 post 请求，

```js
// requestHandlers.js
var querystring = require("quertystring");
function start(response) {
  console.log("Request handler 'start' was called.");
  var body = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; ' +
    'charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<form action="/upload" method="post">' +
    '<textarea name="text" rows="20" cols="60"></textarea>' +
    '<input type="submit" value="Submit text" />' +
    '</form>' +
    '</body>' +
    '</html>';

  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(body);
  response.end();
}

function upload(response, postdata) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("You've sent:" + querystring.parse(postdata).text);
  response.end();
}

exports.start = start
exports.upload = upload
```

```js
// server.js
var http = require("http"),
    url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var postData = "";
    console.log("Request for " + pathname + " received.");
    
    request.setEncoding("utf8"); // not utf-8
    request.addListener("data",function(dataPostChunk) {
      postData += dataPostChunk;
    });
    request.addListener("end",function() {
      route(handle, pathname, response, postData);
    });
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
```

```js
// route.js
function route(handle, pathname, response, postData) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, postData);
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route
```

展示服务器本地图片，借助 fs，硬编码方式

```js
// requestHandlers.js
var querystring = require("quertystring"),
  fs = require("fs");

function start(response) {
}

function upload(response, postData) {
}

function show(response, postData) {
  console.log("Request handler 'show' was called.");
  fs.readFile('./tmp/test.png', function (error, file) {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain" }); // 500 服务器内部错误
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, { "Content-Type": "image/png" });
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start
exports.upload = upload
exports.show = show;
```

接收文件上传，使用 formidable 处理 request 中的表单

```js
// requestHandlers.js
var querystring = require("querystring"),
  fs = require("fs"),
  formidable = require("formidable");

function start(response) {
  console.log("Request handler 'start' was called.");
  var body = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; ' +
    'charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<form action="/upload" enctype="multipart/form-data" ' +
    'method="post">' +
    '<input type="file" name="upload" multiple="multiple">' +
    '<input type="submit" value="Upload file" />' +
    '</form>' +
    '</body>' +
    '</html>';

  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(body);
  response.end();
}

function upload(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function (error, fields, files) {
    console.log("parsing done");
    fs.renameSync(files.upload.path, "./tmp/test.png"); // 将上传文件保存成 "./tmp/test.png"
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write("received image:</br>");
    response.write("<img src = '/show'/>");
    response.end();
  });
}

function show(response) {
}

exports.start = start
exports.upload = upload
exports.show = show
```

```js
var http = require("http");

function start(route, handle) {
  function onRequest(request, response) {
    route(handle, response, request);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
```

```js
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
```




