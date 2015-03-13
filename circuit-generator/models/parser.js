var Component = require('./component');
var wire = Component.wire;
var and = Component.and;
var nand = Component.nand;
var or =Component.or;
var nor = Component.nor;
var xor = Component.xor;
var not = Component.not;

function getGatesRegEx(){
	//return new RegExp('^\\s*(' + 'AND' + ')(\\d+)X(\\d+)\\s+(\\w+)\\s*\\(([\\(\\[\\)\\],\\s\\.\\w\\r\\n\\)]*)\\)\\s*$', 'gm');
	var gates = "";
	var models = [];
	for(model in Component.EDIF){
		models.push('' + model);
	}
	for(var i = 0; i < models.length; i++){
		gates = gates + models[i];
		if(i < models.length - 1)
			 gates = gates + "|";
	}
	return new RegExp('^\\s*(' + gates + ')\\s+(\\w+)\\s*\\(([\\(\\[\\)\\],\\s\\.\\w\\r\\n\\)]*)\\)\\s*$', 'gm');
}

function getWireRegEx(identifier){
	return new RegExp('^\\s*' + identifier + '\\s+([\\d\\w]+)\\s*$', 'gm');
}

function getBusRegEx(identifier){
	return new RegExp('^\\s*' +  identifier + '\\s*\\[(\\d+):(\\d+)\\]\\s*([\\d\\w]+)\\s*$', 'gm');
}

function getParamRegEx(){
	return new RegExp('^\\s*\\.(\\w)\\((.*)\\)\\s*$', 'gm');
}

//


module.exports.parse = function parse(content){ //Netlist parsing function.
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
		var gatesRegex = getGatesRegEx(); //RegEx: Capturing And gate.

		if (wireRegex.test(lines[i])){ //Parsing single wire.
			var wireRegex = getWireRegEx('wire');
			var wireName = wireRegex.exec(lines[i])[1];
			if (typeof wires[wireName] === 'undefined'){ //Checking for double declaration.
				wires [wireName] = new wire();
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
						wires [wireName] = new wire();
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
						wires [wireName] = new wire();
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
				inputs [wireName] = new wire();
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
						inputs [wireName] = new wire();
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
						inputs [wireName] = new wire();
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
				outputs [wireName] = new wire();
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
						outputs [wireName] = new wire();
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
						outputs [wireName] = new wire();
						console.log('Captured output: ' + wireName);
					}else{
						console.log('Parsing error, duplicate declaration ' + wireName);
						console.log(lines[i]);
						return -1;
					}
				}
			}
			console.log('Output Bus [' + busMSB + ':' + busLSB + '] ' + busName);
		}else if (gatesRegex.test(lines[i])){ //Parsing modules.
			var moduleInstance = lines[i];
			moduleInstance = moduleInstance.trim().replace(/\r\n/g, '').trim(); //Stripping module.
			var gatesRegex = getGatesRegEx(); 
			var gateComponents = gatesRegex.exec(moduleInstance); //Geting module tokens.
			//console.log(gateComponents);
			var instanceModel = gateComponents[1].trim(); //Gate model.
			var instanceName = gateComponents[2].trim(); //Module name.
			var gateConnections = gateComponents[3].replace(/\r\n/g, '').replace(/\s+/g, ''); //Extracting connections.
			/*console.log('------');
			console.log('Model: ' + instanceModel);
			console.log('Name: ' + instanceName);
			console.log('Connections: ' + gateConnections);
			console.log('------');*/
			var connectionTokens = gateConnections.split(',');
			var gateInputs = [];
			var gateOuputs = [];
			var EDIFModel = Component.EDIF[instanceModel];

			if(typeof EDIFModel === 'undefined'){ //Checking the existence of the model in the library.
				console.log('Unknown module ' + instanceModel);
				return -1;
			}

			var newGate = new Component[EDIFModel.primitive](instanceModel);
			console.log(moduleInstance);
			for (var p = 0; p < connectionTokens.length; p++) { //Establishing connections.
				var paramRegex = getParamRegEx();
				var matchedTokens = paramRegex.exec(connectionTokens[p]);
				
				var portName = matchedTokens[1];
				var wireName = matchedTokens[2];
				//console.log('Token: ' + portName);
				if(EDIFModel.inputPorts.indexOf(portName) != -1){ //Establishing input connection.
					if (typeof wires[wireName] !== 'undefined'){
						//console.log('Setting input: ' + JSON.stringify(wires[wireName]));
						newGate.addInput(wires[wireName].id);
						wires[wireName].addOutput(newGate.id);
					}else if (typeof inputs[wireName] !== 'undefined'){
						//console.log('Setting input: ' + JSON.stringify(inputs[wireName]));
						newGate.addInput(inputs[wireName].id);
						inputs[wireName].addOutput(newGate.id);
					}else{
						console.log('Undeclared wire ' + wireName); 
						return -1;
					}
				}else if (EDIFModel.outputPorts.indexOf(portName) != -1){ //Establishing output connection.
					if (typeof wires[wireName] !== 'undefined'){
						//console.log('Setting output: ' + JSON.stringify(wires[wireName]));
						newGate.addOutput(wires[wireName].id);
						wires[wireName].setInput(newGate.id);
					}else if (typeof outputs[wireName] !== 'undefined'){
						//console.log('Setting output: ' + JSON.stringify(outputs[wireName]));
						newGate.addOutput(outputs[wireName].id);
						outputs[wireName].setInput(newGate.id);
					}else{
						console.log('Undeclared wire ' + wireName);
						return -1;
					}
				}else{
					console.log('Undefined port ' + portName + ' for ' + EDIFModel.name);
					return -1;
				}
				
			}
			gates.push(newGate);		
			//console.log('*******');

		}
		
	}

	for(var l = 0; l < gates.length; l++){
		//console.log(Component.Readable(gates[l], wiresConcat));
		console.log(gates[l].toString());
		console.log('Inputs: ');
		for(var i = 0; i < gates[l].inputs.length; i++){
			var w = gates[l].inputs[i];
			for(key in wires){
				if(typeof wires[key] !== 'undefined')
					if(wires[key].id == w)
						console.log(key);
			}
			for(key in inputs){
				if(typeof inputs[key] !== 'undefined')
					if(inputs[key].id == w)
						console.log(key);
			}
		}
		console.log('Outputs: ');
		for(var i = 0; i < gates[l].outputs.length; i++){
			var w = gates[l].outputs[i];
			for(key in wires){
				if(typeof wires[key] !== 'undefined')
					if(wires[key].id == w)
						console.log(key);
			}
			for(key in outputs){
				if(typeof outputs[key] !== 'undefined')
					if(outputs[key].id == w)
						console.log(key);
			}
		}

		console.log('--------');
	}
	//console.log(wires);
	return 0;
}