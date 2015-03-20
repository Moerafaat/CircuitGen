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
	BUS: 7,
	INPORT: 8,
	OUTPORT: 9,
	BUF: 10
};
module.exports.Type = Type;

var WireType = {
	INPUT: 0,
	OUTPUT: 1,
	CONNECTION: 2
};

var VerilogToJointMap = {
	and: 'And',
	nand: 'Nand',
	or: 'Or',
	nor: 'Nor',
	xor: 'Xor',
	not: 'Not',
	buf: 'Repeater',
	InputPort: 'Input',
	OutputPort: 'Output'
};

module.exports.WireType = WireType;

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
		case Type.INPORT:
			name = 'input port';
			break;
		case Type.OUTPORT:
			name = 'output port';
			break;
		default:
			name = 'unknown';
	}
	return name;
}
module.exports.getGateName = getGateName;

function getWireTypeName(wire){
	switch(wire.type){
		case WireType.INPUT:
			return 'input';
		case WireType.OUTPUT:
			return 'output';
		case WireType.CONNECTION:
			return 'connection';
		default:
			return 'unknown';
	}

}
module.exports.getGateName = getGateName;

var Component = function(inputs, outputs){ //Component base model.
	this.id = shortId.generate(); //Component ID.
	this.dummy = false; // Needed for algorithm.

	this.inputs = []; //Inputs array.
	if(typeof inputs !== 'undefined'){
		this.inputs = this.inputs.concat(inputs); 
	}
	this.outputs = []; //Outputs array.
	if(typeof outputs !== 'undefined')
		this.outputs = this.outputs.concat(outputs); 

	this.rx = 0;
	this.ry = 0;
	this.x = 0; //Vertical level.
	this.y = 0; //Horizontal level.

	this.xLayout = false;
	this.yLayout = false;

	this.setX = function(val){
		if (val >= 0){
			this.x = val;
			this.xLayout = true;
			this.addGate(this);
		}else
			console.log('Invalid X location: ' + val);
	}

	this.setY = function(val){
		if (val >= 0){
			this.y = val;
			this.yLayout = true;
			this.addGate(this);
		}else
			console.log('Invalid Y location: ' + val);
	}

	this.addInput = function(inputPort){
		if(typeof inputPort === 'undefined')
			return;
		else{
			this.inputs = this.inputs.concat(inputPort);
			this.addGate(this);
		}
	};

	this.addOutput = function(outputPort){
		if(typeof outputPort === 'undefined')
			return;
		else{
			this.outputs = this.outputs.concat(outputPort);
			this.addGate(this);
		}
	};

	this.clearInputs = function(){
		this.inputs = [];
		this.addGate(this);
	}

	this.clearOutputs = function(){
		this.outputs = [];
		this.addGate(this);
	}
}


Component.prototype.toString = function(){
	return getGateName(this) + "(" + this.id + "), inputs: [" + this.inputs + "], outputs: [" + this.outputs + "], model: " + this.model; 
};

Component.gates = {};

Component.wires = {};

Component.prototype.removeWires = function(){
	Component.wires = {};
};


Component.prototype.addGate = function(gate){
	if (typeof gate === 'undefined')
		return;
	Component.gates[gate.id] = gate;
};

Component.prototype.removeGate = function(gate){
	if (typeof gate === 'undefined')
		return;
	delete Component.gates[gate.id];
}

Component.prototype.clearGates = function(){
	Component.gates = {};
}

Component.prototype.clearAll = function(){
	Component.gates = {};
	Component.wires = {};
}

Component.prototype.equals = function(other){
	return (typeof(other) === typeof(this)
			&& this.hasOwnProperty('type') && other.hasOwnProperty('type')
			&& (this.hasOwnProperty('id') && other.hasOwnProperty('id'))
			&& (this.type == other.type) && (this.id == other.id));
}

Component.prototype.printGates = function(){
	for(key in Component.gates){
		console.log('gate: ' + Component.gates[key].toString());
	}
}

Component.prototype.printWires = function(){
	for(key in Component.wires){
		console.log('wire: ' + Component.wires[key].toString());
	}
}

Component.prototype.getInputGate = function(index){
	if (typeof(this.inputs) === 'undefined' || index >= this.inputs.length || this.type == Type.INPUT)
		return {};
	else{
		var inputWire = Component.wires[this.inputs[index]];
		return Component.gates[inputWire.inPort];
	}
}

Component.prototype.getOutputGates = function(index){
	if (typeof(this.outputs) === 'undefined' || index >= this.outputs.length || this.type == Type.OUTPUT)
		return [];
	else{
		var returnGates = [];
		var outputWire = Component.wires[this.outputs[index]];
		var outputPorts = outputWire.outPorts;
		for(var i = 0; i < outputPorts.length; i++)
			returnGates.push(Component.gates[outputPorts[i]]);
		return returnGates;
	}
}


and.prototype = new Component(); //And gate model.
and.prototype.constructor = and;
function and(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.AND;
	this.model = model;
	this.addGate(this);
}

nand.prototype = new Component(); //Nand gate model.
nand.prototype.constructor = nand;
function nand(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NAND;
	this.model = model;
	this.addGate(this);
}

or.prototype = new Component();	//Or gate model.
or.prototype.constructor = or;
function or(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.OR;
	this.model = model;
	this.addGate(this);
}

nor.prototype = new Component(); //Nor gate model.
nor.prototype.constructor = nor;
function nor(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NOR;
	this.model = model;
	this.addGate(this);
}

xor.prototype = new Component();  //Xor gate model.
xor.prototype.constructor = xor;
function xor(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.XOR;
	this.model = model;
	this.addGate(this);
}

not.prototype = new Component(); //Not gate model.
not.prototype.constructor = not;
function not(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.NOT;
	this.model = model;
	this.addGate(this);
}

buf.prototype = new Component(); //Buffer gate model.
buf.prototype.constructor = buf;
function buf(model, inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.BUF;
	this.model = model;
	this.addGate(this);
}


input.prototype = new Component(); //Input model
input.prototype.constructor = input;
function input(inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.INPORT;
	this.addGate(this);
	this.model = 'InputPort';
}

output.prototype = new Component(); //Input model
output.prototype.constructor = output;
function output(inputs, outputs){
	Component.apply(this, inputs, outputs);
	this.type = Type.OUTPORT;
	this.addGate(this);
	this.model = 'OutputPort';
}





module.exports.and = and;
module.exports.nand = nand;
module.exports.or = or;
module.exports.nor = nor;
module.exports.xor = xor;
module.exports.not = not;
module.exports.buf = buf;
module.exports.input = input;
module.exports.output = output;

module.exports.component = Component;

function wire(wireType, input, outputs){
	this.id = shortId.generate(); //Component ID.
	this.type = Type.WIRE; //Component type.
	if (typeof input === 'undefined')
		this.inPort = ''
	else
		this.inPort = input; //Input port.
	this.outPorts = []; //Output port.
	if(typeof outputs !== 'undefined')
		this.outPorts = this.outPorts.concat(outputs); 
	this.x = 0; //Vertical level.
	this.y = 0; //Horizontal level.
	Component.wires[this.id] = this;
	this.xLayout = false;
	this.yLayout = false;

	this.setX = function(val){
		if (val >= 0){
			this.x = val;
			this.xLayout = true;
			Component.wires[this.id] = this;
		}else
			console.log('Invalid X location: ' + val);
	}

	this.setY = function(val){
		if (val >= 0){
			this.y = val;
			this.yLayout = true;
			Component.wires[this.id] = this;
		}else
			console.log('Invalid Y location: ' + val);
	}

	if (typeof wireType === 'undefined')
		this.type = WireType.CONNECTION;
	else
		this.type = wireType;

	this.setInput = function(inputPort){
		if (typeof(inputPort) === 'undefined')
			this.inPort = '';
		else
			this.inPort = inputPort;
		Component.wires[this.id] = this;
	};
	this.addOutput = function(outputPort){
		if(typeof outputPort === 'undefined')
			return;
		else if (this.outPorts.indexOf(outputPort) == -1){
			this.outPorts = this.outPorts.concat(outputPort);
			Component.wires[this.id] = this;
		}
	};
};

wire.prototype.toString = function(){
	var printString = 'Wire(' + this.id + '):';
	if (this.type == WireType.INPUT)
		printString = printString + ' -input wire- ' + ', outputs: [' + this.outPorts + ']';
	else if (this.type == WireType.OUTPUT)
		printString = printString + ' -output wire- ' + ', input: [' + this.inPort + ']';
	else if (this.type == WireType.CONNECTION)
		printString = printString + ' -connection wire- input[' + this.inPort + '], outputs: [' + this.outPorts + ']';
	else printString = printString + ' UNKOWN CONNECTION TYPE';
		return printString;
}

wire.prototype.isFlyingWire = function(){
	return (this.type == WireType.UNKOWN
			|| (this.type == WireType.OUTPUT && (typeof(this.inPort) === 'undefined' || this.inPort == ''))
			|| (this.type == WireType.INPUT && (typeof(this.outPorts) === 'undefined' || this.outPorts.length == 0))
			|| (this.type == WireType.CONNECTION && (typeof(this.inPort) === 'undefined' || this.inPort == '' || typeof(this.outPorts) === 'undefined' || this.outPorts.length == 0)));
}

module.exports.wire = wire;


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
	},
	BUFX2:{
		name: 'BUFX2',
		inputPorts: ['A'],
		outputPorts: ['Y'],
		primitive: 'buf'
	},
	BUFX4:{
		name: 'BUFX4',
		inputPorts: ['A'],
		outputPorts: ['Y'],
		primitive: 'buf'
	},
	getJointMap: function(){
		var map = {};
		for (key in this){
			if (key == 'getJointMap')
				continue;
			map[key]= VerilogToJointMap[this[key].primitive];
		}
		map['InputPort'] = VerilogToJointMap['InputPort'];
		map['OutputPort'] = VerilogToJointMap['OutputPort'];
		return map;
	}
};
