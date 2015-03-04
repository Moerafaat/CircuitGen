var express = require('express');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();

var Component = require('../models/component');
var Wire = Component.Wire;
var Bus = Component.Bus;
var And = Component.And;
var Nand = Component.Nand;
var Or =Component.Or;
var Nor = Component.Nor;
var Xor = Component.Xor;
var Not = Component.Not;

function countArray(obj){ //Key-value array size counter.
	var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function getGateRegEx(gateName){
	return new RegExp('^\\s*(' + gateName + ')(\\d+)X(\\d+)\\s+(\\w+)\\s*\\(([\\(\\[\\)\\],\\s\\.\\w\\r\\n\\)]*)\\)\\s*$', 'gm');
}

function getWireRegEx(identifier){
	return new RegExp('^\\s*' + identifier + '\\s+([\\d\\w]+)\\s*$', 'gm');
}

function getBusRegEx(identifier){
	return new RegExp('^\\s*' +  identifier + '\\s*\\[(\\d+):(\\d+)\\]\\s*([\\d\\w]+)\\s*$', 'gm');
}


function parse(content){ //Netlist parsing function.
	var endmoduleRegex = /endmodule/g; //RegEx: Capturing 'endmodule'.
	var commentRegex = /\/\/.*$/gm; //RegEx: Capturing comments RegEx.
	var mCommentRegex = /\/\*(.|[\r\n])*?\*\//gm; //RegEx: Capturing multi-line comments RegEx.
	var moduleRegex = /module (\w+)\(?.*\)?/gm; //RegEx: capturing module name.;

	content = content.replace(mCommentRegex, ''); //Removing multi-line comments.
	content = content.replace(commentRegex, ''); //Removing single line comments.
	
	var endmoduleCount = (content.match(endmoduleRegex) || []).length; //Counting the occurences of 'endmodule'.
	//console.log(endmoduleCount);

	var moduleCount = (content.match(moduleRegex) || []).length; //Counting the occurences of 'module'.
	//console.log(moduleCount);

	if(endmoduleCount != 1 || moduleCount != 1){
		console.log('Invalid input');
		return -1;
	}
	content = content.replace(endmoduleRegex, ''); //Removing 'endmodule'.
	var moduleName = moduleRegex.exec(content)[1];
	console.log('Module name: ');
	console.log(moduleName);

	content = content.replace(moduleRegex, ''); //Removing module name.
	var lines = content.split(';'); //Splitting data to instructions.

	var wires = [];
	var inputs = [];
	var outputs = [];
	var gates = [];

	for(i = 0; i < lines.length; i++){
		lines[i] = lines[i].trim();

		var wireRegex = getWireRegEx('wire'); //RegEx: Capturing wire.
		var busRegex = getBusRegEx('wire'); //RegEx: Capturing bus.
		var inputRegex = getWireRegEx('input'); //RegEx: Capturing input.
		var inputBusRegex =  getBusRegEx('input'); //RegEx: Capturing input bus.
		var outputRegex = getWireRegEx('output'); //RegEx: Capturing output.
		var outputBusRegex = getBusRegEx('output'); //RegEx: Capturing output bus.
		var gateAndRegex = getGateRegEx('AND'); //RegEx: Capturing And gate.
		
		if (wireRegex.test(lines[i])){ //Parsing single wire.
			var wireRegex = getWireRegEx('wire');
			var wireName = wireRegex.exec(lines[i])[1];
			if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
				wires [wireName] = new Wire([], []);
				console.log('Captured wire: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return -1;
			}
		}else if (busRegex.test(lines[i])){ //Parsing bus.
			var busRegex = getBusRegEx('wire');
			var bus = busRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid bus length ' + busMSB + ':' + busLSB);
				return -1;
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
						wires [wireName] = new Wire([], []);
						console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
						wires [wireName] = new Wire([], []);
						console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}
			console.log('Bus [' + busMSB + ':' + busLSB + '] ' + busName);
		}else if (inputRegex.test(lines[i])){ //Parsing input wire.
			var inputRegex = getWireRegEx('input');
			var wireName = inputRegex.exec(lines[i])[1];
			if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
				inputs [wireName] = new Wire([], []);
				console.log('Captured input: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return -1;
			}
		}else if (inputBusRegex.test(lines[i])){ //Parsing input bus.
			var inputBusRegex =  getBusRegEx('input');
			var bus = inputBusRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid input bus length ' + busMSB + ':' + busLSB);
				return -1;
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof inputs[wireName] === 'undefined'){ //Checking for double declaration.
						inputs [wireName] = new Wire([], []);
						console.log('Captured input: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof inputs[wireName] === 'undefined'){ //Checking for double declaration.
						inputs [wireName] = new Wire([], []);
						console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}
			console.log('Input Bus [' + busMSB + ':' + busLSB + '] ' + busName);

		}else if (outputRegex.test(lines[i])){ //Parsing output wire.
			var outputRegex = getWireRegEx('output');
			var wireName = outputRegex.exec(lines[i])[1];
			if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
				outputs [wireName] = new Wire([], []);
				console.log('Captured output: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return -1;
			}
		}else if (outputBusRegex.test(lines[i])){ //Parsing output bus.
			var outputBusRegex =  getBusRegEx('output');
			var bus = outputBusRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid output bus length ' + busMSB + ':' + busLSB);
				return -1;
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
						outputs [wireName] = new Wire([], []);
						console.log('Captured output: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
						outputs [wireName] = new Wire([], []);
						console.log('Captured output: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}
			console.log('Output Bus [' + busMSB + ':' + busLSB + '] ' + busName);
		}else if (gateAndRegex.test(lines[i])){ //Parsing And gate.
			console.log(lines[i]);
		}
		
	}

	for(key in wires){
		console.log('Wire[' + key + ']: ' + JSON.stringify(wires [key]));
	}

	return 0;
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/parse', function(req, res){ //Netlist upload view.
	res.render('parser_test');
});

router.post('/parse', function(req, res){ //Netlist file parser.
	//console.log(req.files.netlist);
	var filePath = './' + req.files.netlist.path; //Full file path.
	var content; //File content holder.
	fs.readFile(filePath, 'utf8', function read(err, data) { //Reading file content.
	    if (err) {
	    	console.log(err);
	        res.status(500).send('Error');
	        fs.unlink(filePath); //Deleting uploaded file.
	    }else{
	    	content = data;
	    	parse(content); //Parsing file content.
			res.status(200).send(content);
			fs.unlink(filePath); //Deleting processed file.
	    }
	    
	});

	
});

module.exports = router;
