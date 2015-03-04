var shortId = require('shortid');

var Type = {
	WIRE: 0,
	AND: 1,
	NAND: 2,
	OR: 3,
	NOR: 4,
	XOR: 5,
	NOT: 6
};
module.exports.Type = Type;

module.exports.Wire = function (inputs, outputs){
	this.type = Type.WIRE;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.And = function (inshortId.generate()puts, outputs){
	this.id = shortId.generate();
	this.type = Type.AND;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.Or = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.OR;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.Nand = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NAND;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.Nor = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NOR;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.Xor = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.XOR;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};

module.exports.Not = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.NOT;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};