var express = require('express');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();

var Component = require('../models/component');
var Parser = require('../models/parser');
var GraphBuilder = require('../models/graph_builder');
var wire = Component.wire;
var and = Component.and;
var nand = Component.nand;
var or =Component.or;
var nor = Component.nor;
var xor = Component.xor;
var not = Component.not;

function countArray(obj){ //Key-value array size counter.
	var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function getKey(object, value){
    for( var prop in object) {
        if(object.hasOwnProperty(prop)) {
             if( object[prop] === value )
                 return prop;
        }
    }
}

router.get('/', function(req, res){ //Netlist upload view.
	res.render('index', {title: 'Netlist Circuit Generator'});
});

router.get('/about', function(req, res){ //Netlist upload view.
	res.render('about', {title: 'About NCG'});
});


router.get('/ui', function(req, res){ //Netlist upload view.
	res.render('index', {title: 'Netlist Circuit Generator'});
});


router.post('/circuit', function(req, res){ //Netlist file parser.
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
	    	Parser.parse(content, function(err, gates, wires){
	    		if(err){
	    			console.log(err);
	    			res.status(500).send(err);
	    			fs.unlink(filePath); //Deleting processed file.
	    		}else{
	    			var builder = new GraphBuilder(gates);
	    			builder.LongestPathLayering();
	    			builder.ProperLayering();
	    			var graphMapper = { //Mapping gates to logic digarams.
	    					AND2X1: 'And',
							AND2X2: 'And',
							NAND2X1:'Nand',
							NAND2X2: 'Nand',
							OR2X1: 'Or',
							OR2X2: 'Or',
							NOR2X1: 'Nor',
							NOR2X2: 'Nor',
							XOR2X1: 'Xor',
							XOR2X2: 'Xor',
							INVX1: 'Not',
							InputPort: 'Input',
							OutputPort: 'Output'
	    			};

	    			res.render('circuit', { title: 'Circuit',
	    									graphGates: JSON.stringify(gates),
	    									graphWires: JSON.stringify(wires),
	    									graphMapper: JSON.stringify(graphMapper),
	    									content: content});
	    			//res.status(200).send(content);
	    			fs.unlink(filePath); //Deleting processed file.
	    		}
	    	}); //Parsing file content.
			
			
	    }
	    
	});

	
});

module.exports = router;
