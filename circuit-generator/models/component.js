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

function getGateName(gate){
	var name;
	switch(gate.type){
		case Type.AND:
			name = 'and';
			break;
		case Type.OR:
			name = 'or';
			break;
		case Type.NAND:
			name = 'nand';
			break;
		case Type.NOR:
			name = 'nor';
			break;
		case Type.XOR:
			name = 'xor';
			break;
		case Type.NOT:
			name = 'not';
			break;
		case Type.WIRE:
			name = 'wire';
			break;
		case Type.BUS:
			name = 'bus';
			break;
		default:
			name = 'unknown';
	}
	return name;
}
module.exports.getGateName = getGateName;

var Component = function(inputs, outputs){ //Component base model.
	this.id = shortId.generate(); //Component ID.

	this.inputs = []; //Inputs array.
	if(typeof input !== 'undefined'){
		this.inputs = this.inputs.concat(inpur); 
	}
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 

	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.

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
}

Component.prototype.toString = function(){
	return getGateName(this) + "(" + this.id + "), inputs: [" + this.inputs + "], outputs: [" + this.outputs + "], model: " + this.model; 
}


and.prototype = new Component(); //And gate model.
and.prototype.constructor = and;
function and(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.AND;
	this.model = model;
}

nand.prototype = new Component(); //Nand gate model.
nand.prototype.constructor = nand;
function nand(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NAND;
	this.model = model;
}

or.prototype = new Component();	//Or gate model.
or.prototype.constructor = or;
function or(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.OR;
	this.model = model;
}

nor.prototype = new Component(); //Nor gate model.
nor.prototype.constructor = nor;
function nor(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NOR;
	this.model = model;
}

xor.prototype = new Component();  //Xor gate model.
xor.prototype.constructor = xor;
function xor(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.XOR;
	this.model = model;
}

not.prototype = new Component(); //Not gate model.
not.prototype.constructor = not;
function not(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NOT;
	this.model = model;
}



module.exports.and = and;
module.exports.nand = nand;
module.exports.or = or;
module.exports.nor = nor;
module.exports.xor = xor;
module.exports.not = not;




module.exports.wire = function (input, outputs){
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



module.exports.EDIF = {
	AND2X1: {
		name: 'AND2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'and'
	},
	AND2X2:{
		name: 'AND2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'and'
	},
	NAND2X1:{
		name: 'NAND2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'nand'
	},
	NAND2X2: {
		name: 'NAND2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'nand'
	},
	OR2X1:{
		name: 'OR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'or'
	},
	OR2X2:{
		name: 'OR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'or'
	},
	NOR2X1: {
		name: 'NOR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'nor'
	},
	NOR2X2: {
		name: 'NOR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'nor'
	},
	XOR2X1: {
		name: 'XOR2X1',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'xor'
	},
	XOR2X2: {
		name: 'XOR2X2',
		inputPorts: ['A', 'B'],
		outputPorts: ['Y'],
		primitive: 'xor'
	},
	INVX1:{
		name: 'INVX1',
		inputPorts: ['A'],
		outputPorts: ['Y'],
		primitive: 'not'
	}
};
