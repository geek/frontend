'use strict';

var websocket = require('websocket-stream');

var initChart = function(type, id, name) {
  var chart = new Rickshaw.Graph( {
    element: document.getElementById(type + id),
    width: 700,
    height: 300,
    stroke: true,
    series: [{
      data: [],
      color: 'lightblue',
      name: name
    }]
  });
  chart.render();

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: chart,
    xFormatter: function(x) {
      return new Date(x * 1000).toString();
    }
  });

  var annotator = new Rickshaw.Graph.Annotate({
    graph: chart,
    element: document.getElementById(type + '-timeline' + id)
  });

  var ticksTreatment = 'glow';

  var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: chart,
    ticksTreatment: ticksTreatment,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
  });
  xAxis.render();

  var yAxis = new Rickshaw.Graph.Axis.Y({
    graph: chart,
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    ticksTreatment: ticksTreatment
  });
  yAxis.render();

  chart.render();

  return chart;
};

var updateChart = function(graph, point) {
  point.timestamp = point.timestamp || Date.now();
  var previousPoint = graph.series[0].data[graph.series[0].data.length - 1];
  var oldTime = previousPoint ? previousPoint.x : 0;
  var newTime = Math.round(point.timestamp / 1000);
  if (oldTime >= (newTime - 1)) {
    return;
  }

  if (!graph.series) {
    return;
  }

  if (graph.series[0].data.length >= 50) {
    graph.series[0].data = _.drop(graph.series[0].data, graph.series[0].data.length - 49);
  }

  graph.series[0].data.push({ x: newTime, y: point.value });
};

function setupStream() {
  var stream = websocket(document.URL.replace('http', 'ws'));
  stream.on('data', function(data) {
    var parsed = JSON.parse(data);
    let chart;
    parsed.value = parsed.temperature || parsed.humidity;

    if (parsed.temperature !== undefined) {
      chart = document['_tempChart' + parsed.sensorId];
      updateChart(chart, parsed);
      chart.render();
      return;
    }

    chart = document['_humidityChart' + parsed.sensorId];
    updateChart(chart, parsed);
    chart.render();
  });

  stream.once('end', function () {
    setupStream();
  });

  stream.once('error', function (err) {
    console.log(err);
    setTimeout(setupStream, 1000);
  });
}

$(document).ready(function() {
  const locations = ['New York', 'Memphis', 'San Francisco'];

  for (let i = 1; i < 4; i++) {
    document['_tempChart' + i] = initChart('temperature', i, locations[i - 1]);
    document['_humidityChart' + i] = initChart('humidity', i, locations[i - 1]);
  }

  setupStream();
});
