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
var edif = Component.EDIF;

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
	    	Parser.parse(content, null, function(err, gates, wires, warnings){
	    		if(err){
	    			console.log(err);
	    			res.render('circuit', { title: 'Circuit',
	    									error: err,
	    									graphGates: JSON.stringify([]),
	    									graphWires: JSON.stringify([]),
	    									graphMapper: JSON.stringify([]),
	    									content: content});
	    			fs.unlink(filePath); //Deleting processed file.
	    		}else{
	    			//console.log(gates);
	    			var builder = new GraphBuilder(gates);
	    			builder.LongestPathLayering(); // Layering of the DAG
	    			builder.ProperLayering(); // Dummy nodes placement
	    			builder.CrossingReduction(); // Crossing reduction
	    			
	    			var graph_settings = {
	    				max_comp_w: 100,
	    				max_comp_h: 50,
	    				layer_spacing: 150,
	    				node_spacing: 50,
	    				left_marg: 10,
	    				top_marg: 10
	    			};
	    			var GraphingMaterial = builder.AssignAbsoluteValues(graph_settings); // Give Graph absolute values
	    			/*console.log('Gates:');
	    			console.log(GraphingMaterial.gates);
	    			console.log('Adjacency:');
	    			console.log(GraphingMaterial.adjaceny_list);*/

	    			var graphMapper = edif.getJointMap(); //Mapping gates to logic digarams.
	    			var wiresMap = {};
	    			for(var i = 0; i < wires.length; i++)
	    				wiresMap[wires[i].id] = wires[i];
	    			res.render('circuit', { title: 'Circuit',
	    									error: '',
	    									graphGates: JSON.stringify(GraphingMaterial.gates),
	    									graphWires: JSON.stringify(GraphingMaterial.adjaceny_list),
	    									graphMapper: JSON.stringify(graphMapper),
	    									connectionWires: JSON.stringify(wiresMap),
	    									warnings: JSON.stringify(warnings),
	    									content: content});
	    			//res.status(200).send(content);
	    			fs.unlink(filePath); //Deleting processed file.
	    		}
	    	}); //Parsing file content.
			
			
	    }
	    
	});

	
});

module.exports = router;
