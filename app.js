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
	var sh = './test.sh';
	console.log('query: ' + seq);
	console.log('shell: ' + sh);
	process.execFile(sh, [seq], null, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
			res.json({
				"status": -1
			});
		}
		else {
			console.log(stdout);
			//console.log(stderr);
			if (stdout == 'None\n') {
				res.json({
					"status": -2
				});
			}
			else {
				res.json({
					"status": 0,
					"data": eval('(' + stdout + ')')
				});
			}
		}
	});
});

app.post('/upload', multipartMiddleware, function (req, res) {
	var fname = req.body.fname || 'file' + Math.floor(Math.random() * 1000000) + '.wav';
	var filedata = req.body.data;

	var data = filedata.substr(filedata.indexOf(',') + 1);

	var b = new Buffer(data, 'base64');
	var filepath = './public/upload/' + fname;
	console.log(filepath);
	
	fs.writeFile(filepath, b, 'binary',function (err) {
		if (err) {
			console.log(err);
			res.json({
				status: -1,
				msg: err
			});
		} else {
			res.json({
				status: 0,
				msg: 'success',
				id: fname
			});
		}
	});
});

getFileName = function (filepath) {
	// console.log('filepath', filepath);
	if (filepath!=undefined) {
		var fname = filepath.split('/');
		fname = fname[fname.length - 1];
		return fname;
	}
};

var server = app.listen(8008, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
