/*	Components Model  */

var shortId = require('shortid');

//Types enumerations.
var Type = {
	AND: 0,
	NAND: 1,
	OR: 2,
	NOR: 3,
	XOR: 4,
	NOT: 5,
	WIRE: 6,
	BUS: 7
};
module.exports.Type = Type;




module.exports.Wire = function (input, outputs){
	this.id = shortId.generate(); //Component ID.
	this.type = Type.WIRE; //Component type.
	this.inPort = input; //Input port.
	this.outPorts = []; //Output port.
	if(typeof outputs !== 'undefined')
		this.outPorts = this.outPorts.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.setInput = function(input){
		this.inPort = input;
	};
	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outPorts.indexOf(output) == -1)
			this.outPorts = this.outPorts.concat(output);
	};
};

/*module.exports.Bus = function (inputs, outputs){
	this.id = shortId.generate(); //Component ID.
	this.type = Type.BUS; //Component type.
	this.inputs = inputs; //Inputs array.
	this.outputs = outputs; //Outputs array.
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
};*/
function getGateName(gate){
	var name;
	switch(gate.type){
		case Type.AND:
			name = 'And';
			break;
		case Type.OR:
			name = 'Or';
			break;
		case Type.NAND:
			name = 'Nand';
			break;
		case Type.NOR:
			name = 'Nor';
			break;
		case Type.XOR:
			name = 'Xor';
			break;
		case Type.NOT:
			name = 'Not';
			break;
		case Type.WIRE:
			name = 'Wire';
			break;
		case Type.BUS:
			name = 'Bus';
			break;
		default:
			name = 'Unknown';
	}
	return name;
}
module.exports.getGateName = getGateName;

module.exports.Readable = function(component, wires){
	var name = getGateName(component);
	var inputWires = [];
	var outputWires = [];
	var wireName;

	for(key in wires){
		if(component.inputs.indexOf(wires[key].id) != -1){
			inputWires.push(key);
			break;
		}else if(component.outputs.indexOf(wires[key].id) != -1){
			outputWires.push(key);
			break;
		}
	}

	return {gate: name,
		inputs: inputWires,
		outputs: outputWires,
		model: component.model
	};
};


module.exports.And = function (model, x, outputs){
	this.id = shortId.generate(); //Component ID.
	this.type = Type.AND; //Component type.
	this.inputs = []; //Inputs array.
	if(typeof x !== 'undefined'){
		this.inputs = this.inputs.concat(x); 
	}
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
		else
			console.log('Connection: ' + input + ' already exists');
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
		else
			console.log('Connection: ' + output + ' already exists');
	};
};

module.exports.Or = function (model, inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.OR;
	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined')
		this.inputs = this.inputs.concat(inputs); 
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
	};
};

module.exports.Nand = function (model, inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NAND;
	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined')
		this.inputs = this.inputs.concat(inputs); 
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
	};
};

module.exports.Nor = function (model, inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NOR;
	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined')
		this.inputs = this.inputs.concat(inputs); 
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
	};
};

module.exports.Xor = function (model, inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.XOR;
	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined')
		this.inputs = this.inputs.concat(inputs); 
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
	};
};

module.exports.Not = function (model, inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NOT;
	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined')
		this.inputs = this.inputs.concat(inputs); 
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
	this.model = model;

	this.addInput = function(input){
		if(typeof input === 'undefined')
			return;
		else if (this.inputs.indexOf(input) == -1)
			this.inputs = this.inputs.concat(input);
	};

	this.addOutput = function(output){
		if(typeof output === 'undefined')
			return;
		else if (this.outputs.indexOf(output) == -1)
			this.outputs = this.outputs.concat(output);
	};
};

module.exports.EDIF = {
	AND2X1: {
		name: 'AND2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'And'
	},
	AND2X2:{
		name: 'AND2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'And'
	},
	NAND2X1:{
		name: 'NAND2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Nand'
	},
	NAND2X2: {
		name: 'NAND2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Nand'
	},
	OR2X1:{
		name: 'OR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Or'
	},
	OR2X2:{
		name: 'OR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Or'
	},
	NOR2X1: {
		name: 'NOR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Nor'
	},
	NOR2X2: {
		name: 'NOR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Nor'
	},
	XOR2X1: {
		name: 'XOR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Xor'
	},
	XOR2X2: {
		name: 'XOR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'Xor'
	},
	INVX1:{
		name: 'INVX1',
		inputPorts: ['A'],
		outputPorts: ['Y'],
		primitive: 'Not'
	}
};
