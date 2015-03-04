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



module.exports.Wire = function (inputs, outputs){
	this.id = shortId.generate(); //Component ID.
	this.type = Type.WIRE; //Component type.
	this.inputs = inputs; //Inputs array.
	this.outputs = outputs; //Outputs array.
	this.x = -1; //Vertical level.
	this.y = -1; //Horizontal level.
};

module.exports.Bus = function (inputs, outputs){
	this.id = shortId.generate();
	this.type = Type.BUS;
	this.inputs = inputs;
	this.outputs = outputs;
	this.x = -1;
	this.y = -1;
};


module.exports.And = function (inputs, outputs){
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