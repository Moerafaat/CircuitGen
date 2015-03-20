/*Graph Builder Model*/

var Component = require('./component');

var GraphBuilder = function(gates){
	this.layers = new Array(1);
	this.layers[0] = new Array();
	this.gates = gates;
	this.adjaceny_list = new Array(gates.length); // Adjaceny list to build DAG
	for(var i=0; i<gates.length; i++){
		this.adjaceny_list[i] = new Array();
		var neighbours = this.gates[i].getOutputGates(0);
		for(var j=0; j<neighbours.length; j++){
			this.adjaceny_list[i].push(this.gates.indexOf(neighbours[j]));
		}
	}
	// DAG constructed
};

GraphBuilder.prototype.LongestPathLayering = function(){ // Assigning the x-coordinate of the gates
	var assigned = new Array(); // Nodes assigned
	var included = new Array(); // Sublayered nodes
	var current_layer = 0;

	while(assigned.length < this.gates.length){
		var selected = false;
		for(var i=0; i<this.gates.length; i++){
			if(assigned.indexOf(i) == -1){ // Not assigned
				var subset = true;
				for(var j=0; j<this.adjaceny_list[i].length; j++){
					if(included.indexOf(this.adjaceny_list[i][j]) == -1){ // Node neighbours not sublayered
						subset = false;
						break;
					}
				}
				if(subset){
					selected = true;
					this.gates[i].setX(current_layer); // Assign layer
					this.layers[current_layer].push(i); // Insert in layer structure
					assigned.push(i);
				}
			}
		}
		if(!selected){ // No nodes selected
			selected = true;
			current_layer = current_layer + 1;
			this.layers.push(new Array()); // Extend layer structure
			included = merge(included, assigned);
		}
	}
	// Layered DAG constructed
};

GraphBuilder.prototype.ProperLayering = function(){ // Introducing dummy nodes
	for(var i=0; i<this.gates.length; i++){
		for(var j=0; j<this.adjaceny_list[i].length; j++){
			if(this.gates[i].x - this.gates[this.adjaceny_list[i][j]].x > 1){ // If we have long edge
				var dummy;
				var children;
				var end_node_index = this.adjaceny_list[i][j]; // end node
				this.adjaceny_list[i].splice(j, 1); // Remove long edge

				dummy = new Component.component();
				dummy.dummy = true;
				dummy.setX(this.gates[i].x - 1);
				this.gates.push(dummy);
				this.adjaceny_list[i].push(this.gates.length - 1);
				this.layers[dummy.x].push(this.gates.length-1);

				for(var k=2; k<this.gates[i].x - this.gates[this.adjaceny_list[i][j]].x; k++){
					dummy = new Component.component();
					dummy.dummy = true;
					dummy.setX(this.gates[i].x - k);
					this.gates.push(dummy);
					this.layers[dummy.x].push(this.gates.length-1);

					children = new Array();
					children.push(this.gates.length - 1);
					this.adjaceny_list.push(children); // Point to next dummy
				}

				children = new Array();
				children.push(end_node_index);
				this.adjaceny_list.push(children); // Last dummy to end node
			}

			// Placing 2 nodes at maximum per long edge
			/*if(this.gates[i].x - gates[this.adjaceny_list[i][j]].x > 1){
				var dummy = new Component();
				dummy.dummy = true;
				dummy.x = this.gates[i].x - 1;
				var end_node_index = this.adjaceny_list[i][j]; // end node
				var end_node_x = gates[this.adjaceny_list[i][j]].x; // end node x-coordinate

				this.adjaceny_list[i].splice(j, 1); // Remove long edge
				this.gates.push(dummy);
				this.adjaceny_list[i].push(this.gates.length - 1); // Point to dummy
				var children = new Array();
				if(this.gates[i].x - gates[this.adjaceny_list[i][j]].x > 2){ // Inserting 2 dummy nodes
					var dummy2 = new Component();
					dummy2.dummy = true;
					dummy2.x = end_node_x + 1;

					this.gates.push(dummy2);
					children.push(this.gates.length - 1);
					this.adjaceny_list.push(children); // Dummy to dummy2
				}
				children = new Array();
				children.push(end_node_index);
				this.adjaceny_list.push(children); // Dummy or dummy2 to end node (depends on single or double insertion)
			}*/
		}
	}
	// Properly Layered DAG constructed
};

GraphBuilder.prototype.CrossingReduction = function(){
	var random_index_array = new Array();
	for(var i=0; i<this.layers[this.layers.length-1].length; i++){
		random_index_array[i] = i;
	}
	shuffle(random_index_array);
	for(var i=0; i<this.layers[this.layers.length-1].length; i++){ // Assign left most layer (right) with random y locations
		this.gates[this.layers[this.layers.length-1][i]].setY(random_index_array[i]);
	}
	this.layers[this.layers.length-1].sort(compareY(this.gates));

	for(var i=this.layers.length-1; i>0; i--){ // Going left to right

		BaryCenter(this.gates, this.adjaceny_list, this.layers, i, i-1, false);
	}

	for(var i=0; i<this.layers.length-1; i++){ // Going right to left
		BaryCenter(this.gates, this.adjaceny_list, this.layers, i, i+1, true);
	}

	for(var i=0; i<this.layers.length; i++){
		for(var j=0; j<this.layers[i].length; j++){
			this.gates[this.layers[i][j]].setY(j);
		}
	}

	/*console.log("X and Y");
	for(var i=0; i<this.layers.length; i++){
		for(var j=0; j<this.layers[i].length; j++){
			console.log("GATE: " + this.layers[i][j] + " X: " + this.gates[this.layers[i][j]].x + " Y: " + this.gates[this.layers[i][j]].y);
		}
	}*/
	// Cross Reduced Properly Layered DAG constructed
};

function BaryCenter(gates, adjaceny_list, layers, layer1, layer2, is_reversed){
	for(var i=0; i<layers[layer2].length; i++){
		gates[layers[layer2][i]].setY(0);
	}

	if(!is_reversed){
		for(var i=0; i<layers[layer2].length; i++){ // Sum
			for(var j=0; j<layers[layer1].length; j++){
				if(adjaceny_list[layers[layer1][j]].indexOf(layers[layer2][i]) != -1){ // is child
					gates[layers[layer2][i]].setY(gates[layers[layer2][i]].y + j);
				}
			}
		}

		for(var i=0; i<layers[layer2].length; i++){ // Barycenter
			if(gates[layers[layer2][i]].inputs.length != 0){
				gates[layers[layer2][i]].setY(gates[layers[layer2][i]].y * (1/gates[layers[layer2][i]].inputs.length));
			}
			else{
				gates[layers[layer2][i]].setY(0); // Locate the free nodes initially at the top
			}
		}
	}

	else{
		for(var i=0; i<layers[layer2].length; i++){
			for(var j=0; j<layers[layer1].length; j++){
				if(adjaceny_list[layers[layer2][i]].indexOf(layers[layer1][j]) != -1){ // is parent
					gates[layers[layer2][i]].setY(gates[layers[layer2][i]].y + j)
				}
			}
		}

		for(var i=0; i<layers[layer2].length; i++){
			gates[layers[layer2][i]].setY(gates[layers[layer2][i]].y * (1/gates[layers[layer2][i]].outputs.length));
		}
	}

	layers[layer2].sort(compareY(gates)); // Sort by barycenter
}

GraphBuilder.prototype.GetDimensions = function(){
	var max_height = 0;
	for(var i=0; i<this.layers.length; i++){
		if(this.layers[i].length > max_height){
			max_height = this.layers[i].length;
		}
	}

	return {
		width: this.layers.length,
		height: max_height
	}
};

function compareY(gates){
	return function(a, b){
		if(gates[a].y < gates[b].y) return -1;
		if(gates[a].y > gates[b].y) return 1;
		return 0;
	};
}

function shuffle(array){ // Shuffing function
	var currentIndex = array.length, temporaryValue, randomIndex ;
	// While there remain elements to shuffle...
  	while (0 !== currentIndex) {
	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	}
	return array;
}

function merge(array1, array2){ // Union of 2 arrays
	var array = array1;
    for(var i = 0; i < array2.length; i++){
        if(array.indexOf(array2[i]) === -1){
            array.push(array2[i]);
        }
    }
    return array;
};

module.exports = GraphBuilder;