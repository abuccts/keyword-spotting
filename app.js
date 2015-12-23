var express = require('express');
var fs = require('fs');
var process = require('child_process');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();
var app = express();

app.use(express.static('public'));

// ROUTES
app.get('/', function(req, res) {
  res.sendFile('public/index.html', {root: './'});
});

app.post('/public', multipartMiddleware, function(req, res) {
	var seq = req.body.seq.replace(/ /g, '_');
	var sh = 'echo';
	console.log('query: ' + seq);
	console.log('shell: ' + sh);
	process.execFile(sh, [seq], null, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
			res.json({
				status: -1,
			});
		}
		else {
			console.log(stdout);
			//console.log(stderr);
			//var ans = [['20140202320', '发射点反对犯得上反对俗话'], ['dasdsaf238193209B', '多久啊还丰富的省份'], ['23213213A', '蒋介石的恢复']];
			res.json({
				status: 0,
				data: stdout
			});
			console.log(res);
		}
	});
});

var server = app.listen(8008, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
