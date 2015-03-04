var express = require('express');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();

var Component = require('../models/component');

function parse(content){
	var endmoduleRegex = /endmodule/g;
	var commentRegex = /\/\/.*$/gm;
	var mCommentRegex = /\/\*(.|[\r\n])*?\*\//gm;
	var moduleRegex = /module (.*)\(.*\)/gm;

	content = content.replace(mCommentRegex, '');
	content = content.replace(commentRegex, '');
	
	var endmoduleCount = (content.match(endmoduleRegex) || []).length;
	//console.log(endmoduleCount);

	var moduleCount = (content.match(moduleRegex) || []).length;
	//console.log(moduleCount);

	if(endmoduleCount != 1 || moduleCount != 1){
		console.log('Invalid input');
		return -1;
	}
	content = content.replace(endmoduleRegex, '');
	var moduleName = moduleRegex.exec(content)[1];
	console.log('Module name: ');
	console.log(moduleName);

	content = content.replace(moduleRegex, '');
	var lines = content.split(';');

	var wires = [];
	var inputs = [];
	var outputs = [];
	var regs = [];
	var gates = [];

	for(i = 0; i < lines.length; i++){
		var wireRegex = /\s*wire\s+([\d\w]+)\s*$/gm;
		lines[i] = lines[i].trim();
		if (wireRegex.test(lines[i])){
			var wg = /\s*wire\s+([\d\w]+)\s*$/gm
			var a = wg.exec(lines[i]);
			console.log(a[1]);
		}
		//console.log(i);
		//console.log(lines[i]);
	}
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/parse', function(req, res){
	res.render('parser_test');
});

router.post('/parse', function(req, res){
	//console.log(req.files.netlist);
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
