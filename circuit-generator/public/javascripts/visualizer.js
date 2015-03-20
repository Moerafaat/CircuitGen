var current;
function plotGraph(gGates, gWires, map){
    var graphGates = {};
    var graphWires = [];
    var idToIndexMap = [];
    for(i = 0; i < gGates.length; i++){
           idToIndexMap[gGates[i].id] = i;
           if (!gGates[i].xLayout || !gGates[i].yLayout)
                graphGates[gGates[i].id] = new joint.shapes.logic[map[gGates[i].model]]({position: {x: 60*i, y: 60*i}});
           else
            graphGates[gGates[i].id] = new joint.shapes.logic[map[gGates[i].model]]({position: {x: gGates[i].x, y: gGates[i].y}});
           
        }

        for (j = 0; j < gWires.length; j++){
            var gWire = gWires[j];
            if (typeof(gWire.inPort) === 'undefined' || typeof gWire.outPorts === 'undefined'
                || gWire.inPort == '' || gWire.outPorts.length == 0){
                console.log('Skipping: ');
                console.log(gWire);
                continue;
            }

            for(i = 0; i < gWire.outPorts.length; i++){
                if (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.length == 1)
                    graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[0]].id, port:'in'}});
                else 
                    graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[i]].id, port:'in' + (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.indexOf(gWire.id) + 1)}});
            }           
        }


        graph.addCells(_.toArray(graphGates));
        
        _.each(graphWires, function(attributes) { graph.addCell(new joint.shapes.logic.Wire(attributes)) });

        current = initializeSignal();
};

function setPaperDims(width, height){
    if (width > 0 && height > 0 && paper !== 'undefined')
        paper.setDimensions(width, height);
}

function setPaperWidth(width){
    if (width > 0 && paper !== 'undefined')
        paper.setDimensions(width, paper.options.height);
}

function setPaperHeight(height){
    if (height > 0 && paper !== 'undefined')
        paper.setDimensions(paper.options.width, height);
}