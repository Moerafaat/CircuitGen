/*Netlist Parser Model*/

var Component = require('./component');
var component = Component.component;
var wire = Component.wire;
var and = Component.and;
var nand = Component.nand;
var or =Component.or;
var nor = Component.nor;
var xor = Component.xor;
var xnor = Component.xnor;
var not = Component.not;
var buf = Component.buf;
var inputPort = Component.input;
var outputPort = Component.output;
var WireType = Component.WireType;
var EDIF;

function getGatesRegEx(){
	var gates = "";
	var models = [];
	for(model in EDIF){
		models.push('' + model);
	}
	for(var i = 0; i < models.length; i++){
		gates = gates + models[i];
		if(i < models.length - 1)
			 gates = gates + "|";
	}
	return new RegExp('^\\s*(' + gates + ')\\s+(\\w+)\\s*\\(([\\(\\[\\)\\],\\s\\.\\w\\r\\n\\)]*)\\)\\s*$', 'gm');
}

function getPrimRegEx(){
	var gates = "";
	var models = ['and', 'nand', 'or', 'nor', 'xor', 'xnor', 'dff', 'not', 'buf'];

	for(var i = 0; i < models.length; i++){
		gates = gates + models[i];
		if(i < models.length - 1)
			 gates = gates + "|";
	}
	return new RegExp('^\s*(' + gates + ')\s*\((.*)?\)\s*', 'gm');
}

function getWireRegEx(identifier){
	return new RegExp('^\\s*' + identifier + '\\s+(\\S+)\\s*$', 'gm');
}

function getBusRegEx(identifier){
	return new RegExp('^\\s*' +  identifier + '\\s*\\[(\\d+):(\\d+)\\]\\s*(\\S+)\\s*$', 'gm');
}

function getParamRegEx(){
	return new RegExp('^\\s*\\.(\\S+)\\(\\s*(.*)\\s*\\)\\s*$', 'gm');
}

function getAssignRegEx(){
	return new RegExp('\\s*assign\\s*(\\S+)\\s*=\\s*(\\S+)\\s*', 'gm');
}

function getAssignReplaceRegEx(wireName){
	return new RegExp('\\b('+ wireName + ')\\b', 'gm');
}

function getCellDefineRegEx(){
	return new RegExp('\\s*`celldefine([\\s\\S]+?)`endcelldefine\\s*', '');
}

function getSpecifyRegEx(){
	return new RegExp('\\s*specify[\\s\\S]*?endspecify\\s*', '');
}




module.exports.parseLibrary = function(content, callback){
	var parsedEdif = {};
	var timescaleRegex = /\s*`\s*timescale.*$/gm;
	content = content.replace(timescaleRegex, '').trim();

	var cellsDefinitions = {};
	var cellDefineRegEx = getCellDefineRegEx();
	while(cellDefineRegEx.test(content)){
		cellDefineRegEx = getCellDefineRegEx();
		var cell = cellDefineRegEx.exec(content)[1].trim();

		var endmoduleRegex = /\s*endmodule\s*/g;
		var moduleRegex = /\s*module (\w+)\s*\(?.*\)?\s*;\s*/gm;

		var endmoduleCount = (cell.match(endmoduleRegex) || []).length; //Counting the occurences of 'endmodule'.
		//console.log(endmoduleCount);

		var moduleCount = (cell.match(moduleRegex) || []).length; //Counting the occurences of 'module'.
		//console.log(moduleCount);

		var warnings = [];

		if(endmoduleCount != 1 || moduleCount != 1){
			console.log('Invalid input');
			return callback('Error while parsing the module ' + moduleName, null);
		}
		cell = cell.replace(endmoduleRegex, ''); //Removing 'endmodule'.

		var moduleName = moduleRegex.exec(cell)[1];		
		cell = cell.replace(moduleRegex, ''); //Removing module name.

		var specifyRegex = getSpecifyRegEx();
		cell = cell.replace(specifyRegex, '');

		cellsDefinitions[moduleName] = cell;
		content = content.replace(getCellDefineRegEx(), '');
		cellDefineRegEx = getCellDefineRegEx();
	}
	for (key in cellsDefinitions){
		var currentCell = cellsDefinitions[key];
		var defLines = currentCell.split(/\s*;\s*/gm);
		for(var i = 0; i < defLines.length; i++){
			defLines[i] = defLines[i].trim();
			if (defLines[i] == '')
				defLines.splice(i--, 1);
		}

		var cellObject = {name: key,
						  inputPorts: [],
						  outputPorts: []
						};

		for(var i = 0; i < defLines.length; i++){
			var wireRegex = getWireRegEx('wire'); //RegEx: Capturing wire.
			var inputRegex = getWireRegEx('input'); //RegEx: Capturing input.
			var outputRegex = getWireRegEx('output'); //RegEx: Capturing output.
			var primRegex = getPrimRegEx();
			if (wireRegex.test(defLines[i])){
				console.log('Wires in library are not supported yet');
			}else if (inputRegex.test(defLines[i])){
				var inputRegex = getWireRegEx('input');
				var wireName = inputRegex.exec(defLines[i])[1];
				cellObject.inputPorts.push(wireName);
			}else if (outputRegex.test(defLines[i])){
				var outputRegex = getWireRegEx('output');
				var wireName = outputRegex.exec(defLines[i])[1];
				cellObject.outputPorts.push(wireName);
			}else if (primRegex.test(defLines[i])){
				var primRegex = getPrimRegEx();
				var primName = primRegex.exec(defLines[i])[1];
				cellObject['primitive'] = primName;
			}else{
				console.log('Invalid line ' + defLines[i]);
				return callback('Invalid line ' + defLines[i] + '.', null);
			}
		}
		parsedEdif[key] = cellObject;

	}


	callback(null, parsedEdif);
};



module.exports.parseNetlist = function parse(content, EDIFContent, callback){ //Netlist parsing function.
	var endmoduleRegex = /endmodule/g; //RegEx: Capturing 'endmodule'.
	var commentRegex = /\/\/.*$/gm; //RegEx: Capturing comments RegEx.
	var mCommentRegex = /\/\*(.|[\r\n])*?\*\//gm; //RegEx: Capturing multi-line comments RegEx.
	var moduleRegex =  /\s*module (\w+)\s*\(?.*\)?\s*;\s*/gm; //RegEx: capturing module name.;

	EDIF = EDIFContent;

	content = content.replace(mCommentRegex, ''); //Removing multi-line comments.
	content = content.replace(commentRegex, ''); //Removing single line comments.
	
	var endmoduleCount = (content.match(endmoduleRegex) || []).length; //Counting the occurences of 'endmodule'.
	//console.log(endmoduleCount);

	var moduleCount = (content.match(moduleRegex) || []).length; //Counting the occurences of 'module'.
	//console.log(moduleCount);

	var warnings = [];

	if(endmoduleCount != 1 || moduleCount != 1){
		console.log('Invalid input');
		return callback('Invalid input.', null, null, null);
	}
	content = content.replace(endmoduleRegex, ''); //Removing 'endmodule'.
	var moduleName = moduleRegex.exec(content)[1];
	//console.log('Module name: ');
	//console.log(moduleName);

	content = content.replace(moduleRegex, ''); //Removing module name.
	var lines = content.split(';'); //Splitting data to instructions.

	var wires = [];
	var inputs = [];
	var outputs = [];
	var gates = [];

	var handleAssign = function(){
		//console.log(gates);
		for(var i = 0; i < lines.length; i++){
			lines[i] = lines[i].trim();
			var assignRegex = getAssignRegEx();
			if (assignRegex.test(lines[i])){
					console.log('Assign: ' + lines[i]);
					var assignRegex = getAssignRegEx();
					var sides = assignRegex.exec(lines[i]);
					var lhs = sides[1];
					var rhs = sides[2];
					var lhsWire;
					var rhsWire;
					var isLConnection = false;
					var isLInput = false;
					var isLOutput = false;
					var isRConnection = false;
					var isRInput = false;
					var isROutput = false;
					if (typeof(wires[lhs]) !== 'undefined'){
						isLConnection = true;
						lhsWire = wires[lhs];
					}else if (typeof(inputs[lhs]) !== 'undefined'){
						isLInput = true;
						lhsWire = inputs[lhs];
					}else if (typeof(outputs[lhs]) !== 'undefined'){
						isLOutput = true;
						lhsWire = outputs[lhs];
					}else{
						console.log('Warning, undefined wire ' + lhs);
						warnings.push('Warning, undefined wires ' + lhs + '.');
						continue;
					}

					if (typeof(wires[rhs]) !== 'undefined'){
						isRConnection = true;
						rhsWire = wires[rhs];
					}else if (typeof(inputs[rhs]) !== 'undefined'){
						isRInput = true;
						rhsWire = inputs[rhs];
					}else if (typeof(outputs[rhs]) !== 'undefined'){
						isROutput = true;
						rhsWire = outputs[rhs];
					}else{
						console.log('Warning, undefined wire ' + rhs);
						warnings.push('Warning, undefined wires ' + rhs + '.');
						continue;
					}

					//console.log('LHS: ' + lhsWire);
					//console.log('RHS: ' + rhsWire);
					if(lhsWire.type != WireType.CONNECTION && rhsWire.type != WireType.CONNECTION){
							if (lhsWire.type == WireType.INPUT){
								console.log('Cannot assign to input wire');
								warnings.push('Warning, cannot assign wire ' + rhs + 'to input wire ' + lhs);
								continue;
							}else if (rhsWire.type == WireType.OUTPUT){
								//console.log('Output to Output');
								var outputGate = component.gates[lhsWire.outPorts[0]];
								outputGate.clearInputs();
								outputGate.addInput(rhsWire.id);
								rhsWire.addOutput(outputGate.id);
								if (isLInput){
									delete inputs[lhs];
									delete component.wires[lhs];
								}else if (isLOutput){
									delete outputs[lhs];
									delete component.wires[lhs];
								}else if (isLConnection){
									delete wires[lhs];
									delete component.wires[lhs];
								}else
									console.log('Unkown wire type ' + lhsWire);
							}else if(rhsWire.type == WireType.INPUT){
								//console.log('Input to Output');
								var outputGate = component.gates[lhsWire.outPorts[0]];
								outputGate.clearInputs();
								outputGate.addInput(rhsWire.id);
								rhsWire.addOutput(outputGate.id);
								console.log(outputGate);
								if (isLInput){
									delete inputs[lhs];
									delete component.wires[lhs];
								}else if (isLOutput){
									delete outputs[lhs];
									delete component.wires[lhs];
								}else if (isLConnection){
									delete wires[lhs];
									delete component.wires[lhs];
								}else
									console.log('Unkown wire type ' + lhsWire);
							}else
								console.log('Invalid assign');
					}else if (lhsWire.type == WireType.CONNECTION){
							//console.log('Wire <- Input/Output');
							for(var j = 0; j < lines.length; j++){
								if (j == i)
									continue;
								else{
									var before =  lines[j]; 
									var replacementRegex = getAssignReplaceRegEx(lhs);
									lines[j] = lines[j].replace(replacementRegex, rhs);
									if (before != lines[j])
										console.log('Replaced ' + before + ' with ' + lines[j]);
								}
							}
					}else if (rhsWire.type == WireType.CONNECTION){
							//console.log('Output <- Wire ');
							//console.log(lhsWire);
							if (lhsWire.type != WireType.OUTPUT){
								console.log('Cannot assign to input wire');
								warnings.push('Warning, cannot assign wire ' + rhs + 'to input wire ' + lhs);
								continue;
							}
							var outputGate = component.gates[lhsWire.outPorts[0]];
							outputGate.clearInputs();
							outputGate.addInput(rhsWire.id);
							rhsWire.addOutput(outputGate.id);
							console.log(outputGate);
							if (isLInput){
								delete inputs[lhs];
								delete component.wires[lhs];
							}else if (isLOutput){
								delete outputs[lhs];
								delete component.wires[lhs];
							}else if (isLConnection){
								delete wires[lhs];
								delete component.wires[lhs];
							}else
								console.log('Unkown wire type ' + lhsWire);

					}else{
							console.log('Error at ' + lhs + ':' + lhsWire+ '\n' + rhs + ':' + rhsWire);
					}
						
				lines.splice(i--, 1);
			}
		}
	}

	for(var i = 0; i < lines.length; i++){ //Parsing wires.
		lines[i] = lines[i].trim();
		if (lines[i] == '')
			continue;

		var wireRegex = getWireRegEx('wire'); //RegEx: Capturing wire.
		var busRegex = getBusRegEx('wire'); //RegEx: Capturing bus.
		var inputRegex = getWireRegEx('input'); //RegEx: Capturing input.
		var inputBusRegex =  getBusRegEx('input'); //RegEx: Capturing input bus.
		var outputRegex = getWireRegEx('output'); //RegEx: Capturing output.
		var outputBusRegex = getBusRegEx('output'); //RegEx: Capturing output bus.

		if (wireRegex.test(lines[i])){ //Parsing single wire.
			var wireRegex = getWireRegEx('wire');
			var wireName = wireRegex.exec(lines[i])[1];
			if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
				wires [wireName] = new wire();
				//console.log('Captured wire: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
			}
		}else if (busRegex.test(lines[i])){ //Parsing bus.
			var busRegex = getBusRegEx('wire');
			var bus = busRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid bus length' + busMSB + ':' + busLSB);
				return callback('Parsing error, invalid bus length' + busMSB + ':' + busLSB, null, null, null);
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
						wires [wireName] = new wire();
						//console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration '  + wireName , null, null, null);
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
						wires [wireName] = new wire();
						//console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
					}
				}
			}
			console.log('Bus [' + busMSB + ':' + busLSB + '] ' + busName);
		}else if (inputRegex.test(lines[i])){ //Parsing input wire.
			var inputRegex = getWireRegEx('input');
			var wireName = inputRegex.exec(lines[i])[1];
			if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
				var newInput = new inputPort();
				inputs [wireName] = new wire(WireType.INPUT, newInput.id);
				newInput.addOutput(inputs[wireName].id);
				gates.push(newInput);
				//console.log('Captured input: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
			}
		}else if (inputBusRegex.test(lines[i])){ //Parsing input bus.
			var inputBusRegex =  getBusRegEx('input');
			var bus = inputBusRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid input bus length ' + busMSB + ':' + busLSB);
				return callback('Parsing error, invalid input bus length ' + busMSB + ':' + busLSB, null, null, null);
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof inputs[wireName] === 'undefined'){ //Checking for double declaration.
						var newInput = new inputPort();
						inputs [wireName] = new wire(WireType.INPUT, newInput.id);
						newInput.addOutput(inputs[wireName].id);
						gates.push(newInput);
						//console.log('Captured input: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof inputs[wireName] === 'undefined'){ //Checking for double declaration.
						var newInput = new inputPort();
						inputs [wireName] = new wire(WireType.INPUT, newInput.id);
						newInput.addOutput(inputs[wireName].id);
						gates.push(newInput);
						//console.log('Captured wire: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
					}
				}
			}
			//console.log('Input Bus [' + busMSB + ':' + busLSB + '] ' + busName);

		}else if (outputRegex.test(lines[i])){ //Parsing output wire.
			var outputRegex = getWireRegEx('output');
			var wireName = outputRegex.exec(lines[i])[1];
			if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
					var newOutput = new outputPort();
					outputs [wireName] = new wire(WireType.OUTPUT,'',[newOutput.id]);
					newOutput.addInput(outputs[wireName].id);
					gates.push(newOutput);
				//console.log('Captured output: ' + wireName);
			}else{
				console.log('Parsing error, duplicate declaration ' + wireName);
				console.log(i + ' ' + lines[i]);
				return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
			}
		}else if (outputBusRegex.test(lines[i])){ //Parsing output bus.
			var outputBusRegex =  getBusRegEx('output');
			var bus = outputBusRegex.exec(lines[i]);
			var busMSB = parseInt(bus[1]);
			var busLSB = parseInt(bus[2]);
			var busName = bus[3];
			if(busLSB == busMSB){
				console.log('Parsing error, invalid output bus length ' + busMSB + ':' + busLSB);
				return callback('Parsing error, invalid output bus length ' + busMSB + ':' + busLSB, null, null, null);
			}else if (busLSB < busMSB){
				for(j = busLSB; j <= busMSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
						var newOutput = new outputPort();
						outputs [wireName] = new wire(WireType.OUTPUT, '', [newOutput.id]);
						newOutput.addInput(outputs[wireName].id);
						gates.push(newOutput);						//console.log('Captured output: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
					}
				}
			}else if (busLSB > busMSB){
				for(j = busMSB; j <= busLSB; j++){
					var wireName = busName + '[' + j + ']';
					if (typeof outputs[wireName] === 'undefined'){ //Checking for double declaration.
						var newOutput = new outputPort();
						outputs [wireName] = new wire(WireType.OUTPUT, '', [newOutput.id]);
						newOutput.addInput(outputs[wireName].id);
						gates.push(newOutput);
							//console.log('Captured output: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return callback('Parsing error, duplicate declaration ' + wireName, null, null, null);
					}
				}
			}
		}else 
			break;
		lines.splice(i--, 1);
		
	}

	handleAssign();

	for(var i = 0; i < lines.length; i++){ //Parsing gates.
		lines[i] = lines[i].trim();
		if (lines[i] == '')
			continue;
		var gatesRegex = getGatesRegEx(); //RegEx: Capturing logical gate.
		if (gatesRegex.test(lines[i])){ //Parsing modules.
			var moduleInstance = lines[i];
			moduleInstance = moduleInstance.trim().replace(/\r\n/g, '').trim(); //Stripping module.
			var gatesRegex = getGatesRegEx(); 
			var gateComponents = gatesRegex.exec(moduleInstance); //Geting module tokens.
			var instanceModel = gateComponents[1].trim(); //Gate model.
			var instanceName = gateComponents[2].trim(); //Module name.
			var gateConnections = gateComponents[3].replace(/\r\n/g, '').replace(/\s+/g, ''); //Extracting connections.
			var connectionTokens = gateConnections.split(',');
			var gateInputs = [];
			var gateOuputs = [];
			var EDIFModel = EDIF[instanceModel];

			if(typeof EDIFModel === 'undefined'){ //Checking the existence of the model in the library.
				console.log('Unknown module ' + instanceModel);
				return callback('Unknown module ' + instanceMode, null, null, null);
			}

			if (EDIFModel.hasOwnProperty('compound') && EDIFModel.compound){
				EDIFModel.getComponent(function(subGates, subWires){
							for (key in subWires){
								wires[key] = subWires[key];
							}

							for (var p = 0; p < connectionTokens.length; p++) { //Establishing connections.
								var paramRegex = getParamRegEx();
								var matchedTokens = paramRegex.exec(connectionTokens[p]);
								var portName = matchedTokens[1];
								var wireName = matchedTokens[2];
								if(EDIFModel.inputPorts.indexOf(portName) != -1){ //Establishing input connection.
									if (typeof wires[wireName] !== 'undefined'){
										for(var z = 0; z < subGates.length; z++){
											var wirePlaced = false;
											if (subGates[z].openInputTerminals > 0){
												subGates[z].addInput(wires[wireName].id);
												wires[wireName].addOutput(subGates[z].id);
												wirePlaced = true;
												break;
											}
										}
										if (!wirePlaced){
											console.log('Could not connect the wire ' + wireName);
										}
										
									}else if (typeof inputs[wireName] !== 'undefined'){
										for(var z = 0; z < subGates.length; z++){
											var wirePlaced = false;
											if (subGates[z].openInputTerminals > 0){
												console.log('Connecting input wire: ' + wireName + ' to ' + subGates[z].model + '  ' + subGates[z].id);

												subGates[z].addInput(inputs[wireName].id);
												inputs[wireName].addOutput(subGates[z].id);
												wirePlaced = true;
												break;
											}
										}
										if (!wirePlaced){
											console.log('Could not connect the wire ' + wireName);
										}

									}else{
										console.log('Undeclared wire ' + wireName); 
										return callback('Undeclared wire ' + wireName, null, null, null);
									}
								}else if (EDIFModel.outputPorts.indexOf(portName) != -1){ //Establishing output connection.
									if (typeof wires[wireName] !== 'undefined'){
										for(var z = 0; z < subGates.length; z++){
											var wirePlaced = false;
											if (subGates[z].openOutputTerminals > 0){
												subGates[z].addOutput(wires[wireName].id);
												wires[wireName].setInput(subGates[z].id);
												wirePlaced = true;
												break;
											}
										}
										if (!wirePlaced){
											console.log('Could not connect the wire ' + wireName);
										}

									}else if (typeof outputs[wireName] !== 'undefined'){
										for(var z = 0; z < subGates.length; z++){
											var wirePlaced = false;
											if (subGates[z].openOutputTerminals > 0){
												subGates[z].addOutput(outputs[wireName].id);
												outputs[wireName].setInput(subGates[z].id);
												wirePlaced = true;
												break;
											}
										}
										if (!wirePlaced){
											console.log('Could not connect the wire ' + wireName);
										}
									}else{
										console.log('Undeclared wire ' + wireName);
										return callback('Undeclared wire ' + wireName, null, null, null);
									}
								}else{
									console.log('Undefined port ' + portName + ' for ' + EDIFModel.name);
									return callback('Undefined port ' + portName + ' for ' + EDIFModel.name, null, null, null);
								}
								
							}
							for (var f = 0; f < subGates.length; f++)
								gates.push(subGates[f]);
						
					});
				
					
			}else{
				var newGate = new Component[EDIFModel.primitive](instanceModel);
				for (var p = 0; p < connectionTokens.length; p++) { //Establishing connections.
					var paramRegex = getParamRegEx();
					var matchedTokens = paramRegex.exec(connectionTokens[p]);
					var portName = matchedTokens[1];
					var wireName = matchedTokens[2];
					if(EDIFModel.inputPorts.indexOf(portName) != -1){ //Establishing input connection.
						if (typeof wires[wireName] !== 'undefined'){
							newGate.addInput(wires[wireName].id);
							wires[wireName].addOutput(newGate.id);
						}else if (typeof inputs[wireName] !== 'undefined'){
							newGate.addInput(inputs[wireName].id);
							inputs[wireName].addOutput(newGate.id);
						}else{
							console.log('Undeclared wire ' + wireName); 
							return callback('Undeclared wire ' + wireName, null, null, null);
						}
					}else if (EDIFModel.outputPorts.indexOf(portName) != -1){ //Establishing output connection.
						if (typeof wires[wireName] !== 'undefined'){
							newGate.addOutput(wires[wireName].id);
							wires[wireName].setInput(newGate.id);
						}else if (typeof outputs[wireName] !== 'undefined'){
							newGate.addOutput(outputs[wireName].id);
							outputs[wireName].setInput(newGate.id);
						}else{
							console.log('Undeclared wire ' + wireName);
							return callback('Undeclared wire ' + wireName, null, null, null);
						}
					}else{
						console.log('Undefined port ' + portName + ' for ' + EDIFModel.name);
						return callback('Undefined port ' + portName + ' for ' + EDIFModel.name, null, null, null);
					}
					
				}
				gates.push(newGate);
			}

		}else{
			console.log('Invalid line ' + lines[i]);
			warnings.push('Invalid line ' + lines[i] + ', ignored while parsing');
		}
	}
	


	var allWires = new Array();
	for(key in wires){
		//console.log(key + ' : ' + wires[key].id);
		allWires.push(wires[key]);
	}
	for(key in inputs){
		//console.log(key + ' : ' + inputs[key].id);
		allWires.push(inputs[key]);
	}
	for(key in outputs){
		//console.log(key + ' : ' + outputs[key].id);
		allWires.push(outputs[key]);
	}

		
		for(i = 0; i < allWires.length; i++)
		if (allWires[i].isFlyingWire()){
			console.log('Warning, flying wire ');
			warnings.push('Warning detected flying wire, trimmed before graphing');
			console.log(allWires[i]);
			for (var j = 0; j < gates.length; j++){
				var inputIndex = gates[j].inputs.indexOf(allWires[i].id);
				var outputIndex = gates[j].outputs.indexOf(allWires[i].id);
				if (inputIndex != -1){
					gates[j].inputs.splice(inputIndex, 1);
				}
				if(outputIndex != -1){
					gates[j].outputs.splice(outputIndex, 1);
				}
			}
			allWires.splice(i, 1);
			i--;
		}


	return callback(null, gates, allWires, warnings);
}