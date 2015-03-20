var current;
function countOccur(array, element){
    var indices = [];
    var idx = array.indexOf(element);
    while (idx != -1) {
      indices.push(idx);
      idx = array.indexOf(element, idx + 1);
    }
    return indices.length;
}
function plotGraph(gGates, gWires, map){
    var graphGates = {};
    var graphWires = [];
    var idToIndexMap = [];
    for(i = 0; i < gGates.length; i++){
           if(gGates[i].dummy)
                continue;
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
            //console.log(gWire);
            for(i = 0; i < gWire.outPorts.length; i++){
                //console.log('Wire ' + gWire.id + ' : ' + gWire.outPorts[i]);
                if (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.length == 1)
                    graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[i]].id, port:'in'}});
                else if (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.length == 2){
                    //console.log(gWire.id + ' in ');
                    //console.log(gGates[idToIndexMap[gWire.outPorts[i]]]);
                    //console.log(countOccur(gGates[idToIndexMap[gWire.outPorts[i]]].inputs, gWire.id));
                    if(countOccur(gGates[idToIndexMap[gWire.outPorts[i]]].inputs, gWire.id) == 2){
                        //console.log('Same input for 2 ports');
                        graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[i]].id, port:'in' + (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.indexOf(gWire.id) + 1)}});
                        graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[i]].id, port:'in' + (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.indexOf(gWire.id) + 2)}});
                    }else{
                        graphWires.push({source: {id: graphGates[gWire.inPort].id, port: 'out'}, target:{id: graphGates[gWire.outPorts[i]].id, port:'in' + (gGates[idToIndexMap[gWire.outPorts[i]]].inputs.indexOf(gWire.id) + 1)}});
                    }
                }else{
                    console.warn('The current version only support graphing 2-input gates.');
                }
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

function fitView(){
    paper.fitToContent();
    var width = paper.options.width;
    var height = paper.options.height;
    setPaperDims(width + 110, height + 60);
    width += 110;
    height += 60;
    var containerElement = $("#tabs-container");
    var currentWidth = parseFloat(containerElement.css('width'));
    var currentHeight = parseFloat(containerElement.css('height'));
    if (width > currentWidth){
        containerElement.css('min-width', width + 'px');
    }
    if (height > currentHeight){
        containerElement.css('min-height', height + 'px');
    }
}