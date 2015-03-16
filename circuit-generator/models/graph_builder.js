var Component = require('./component');

var GraphBuilder = function(gates){
	this.layers = new Array(1);
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
					this.gates[i].x = current_layer; // Assign layer
					this.layers[current_layer].push(i); // Insert in layer structure
					assigned.push(i);
				}
			}
		}
		if(!selected){ // No nodes selected
			selected = true;
			current_layer = current_layer + 1;
			this.layers.push(new Array()); // Extend layer structure
			included = included.merge(assigned);
		}
	}
};

GraphBuilder.prototype.ProperLayering = function(){ // Introducing dummy nodes
	for(var i=0; i<this.gates.length; i++){
		for(var j=0; j<this.adjaceny_list[i].length; i++){
			for(var k=1; k<this.gates[i].x - gates[this.adjaceny_list[i][j]].x; k++){
				
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
	for(var i=0; i<this.layers[0].length; i++){
		random_index_array[i] = i;
	}
	shuffle(random_index_array);
	for(var i=0; i<this.layers[0].length; i++){ // Assign layer 0 with random y locations
		this.gate[this.layers[0][i]].y = random_index_array[i];
	}

	for(var i=0; i<this.layers.length; i++){ // Going left to right

	}

	for(var i=this.layers.length-1; i>=0; i--){ // Going right to left

	}
};

function BaryCenter(layer1, layer2){
	var barycenter;
	for(var i=0; i<layer2.length; i++){
		var neighbours_count = this.adjaceny_list[layer2[i]].length;
		var positions_sum = 0;
		for(var j=0; j<this.adjaceny_list[layer2[i]].length; j++){ // sum of parent 
			positions_sum = positions_sum + gates[this.adjaceny_list[layer2[i]][j]].y;
		}
		barycenter = (1/neighbours_count) * positions_sum;
	}
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

Array.prototype.merge = function(array){ // Union of 2 arrays
    for(var i = 0; i < array.length; i++){
        if(this.indexOf(array[i]) === -1){
            this.push(array[i]);
        }
    }
    return this;
};