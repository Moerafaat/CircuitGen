var express = require('express');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();

function parse(content){
	console.log(content);
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/parse', function(req, res){
	res.render('parser_test');
});

router.post('/parse', function(req, res){
	console.log(req.files.netlist);
	var filePath = './' + req.files.netlist.path;
	var content;
	fs.readFile(filePath, 'utf8', function read(err, data) {
	    if (err) {
	    	console.log(err);
	        res.status(500).send('Error');
	        fs.unlink(filePath);
	    }else{
	    	content = data;
	    	//console.log(content);
	    	parse(content);
			res.status(200).send(content);
			fs.unlink(filePath);
	    }
	    
	});

	
});

module.exports = router;
