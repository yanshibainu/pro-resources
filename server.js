const express = require("express");

const app = express();

app.get("/", function(req, res) {
  res.sendfile(__dirname + '/index.html', function(err) {
      if (err) res.send(404);
  });
});

app.get(/(.*)\.(htm|html|)/i, function(req, res) {

  
  const filePath = __dirname + req.path;
  console.log('%c⧭', 'color: #e50000', filePath);
  res.sendfile(filePath, function(err) {
      console.log('%c⧭', 'color: #aa00ff', err);
      if (err) res.send(404);
  });
});

app.get(/(.*)\.(jpg|gif|png|ico|css|js|txt)/i, function(req, res) {
  //console.log('%c⧭', 'color: #00a3cc', req);
  res.sendfile(__dirname + "/" + req.params[0] + "." + req.params[1], function(err) {
      if (err) res.send(404);
  });
});

port = process.env.PORT || 3333;
app.listen(port, function() {
  console.log(`> Ready on http://localhost:${port}`)
});