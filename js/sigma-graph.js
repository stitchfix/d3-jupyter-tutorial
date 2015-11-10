var g = $graph_data ;

s = new sigma({graph: g, container: '$container', settings: { defaultNodeColor: '#ec5148'} });

s.graph.nodes().forEach(function(n) {
  n.originalColor = n.color;
});
s.graph.edges().forEach(function(e) {
  e.originalColor = e.color;
});

s.bind('clickNode', function(e) {
  var nodeId = e.data.node.id,
      toKeep = s.graph.neighbors(nodeId);
  toKeep[nodeId] = e.data.node;

  s.graph.nodes().forEach(function(n) {
    if (toKeep[n.id])
      n.color = n.originalColor;
    else
      n.color = '#eee';
  });

  s.graph.edges().forEach(function(e) {
    if (toKeep[e.source] && toKeep[e.target])
      e.color = e.originalColor;
    else
      e.color = '#eee';
  });

  s.refresh();
});

s.bind('clickStage', function(e) {
  s.graph.nodes().forEach(function(n) {
    n.color = n.originalColor;
  });

  s.graph.edges().forEach(function(e) {
    e.color = e.originalColor;
  });

  s.refresh();
});
