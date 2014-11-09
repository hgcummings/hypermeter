var config = require('./config.json');
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");
var program = require('commander');
var plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);

program
  .option('-r, --revision [value]', 'SVN revision number or git commit hash')
  .parse(process.argv);

plotly.getFigure(process.env.PLOTLY_USERNAME, config.plot.id, function(err, figure) {
  var existingTraces = [];
  var requests = [];
  var failures = [];
  var updatedTraces = [];
  var updatedTraceKeys = [];
  var newTraces = [];

  if (figure) {
    existingTraces = figure.data.map(function(trace) { return trace.name; });
    console.log(existingTraces);
  }

  config.urls.forEach(function(url, i) {
     var start = process.hrtime();
     requests.push(HTTP.request(url)
         .then(function(response) {
             var diff = process.hrtime(start);
             var millis = diff[0] * 1e3 + Math.round(diff[1] / 1e6);
             console.log(url + ' returned %s, took %d milliseconds',
                 response.status, millis);
             if (parseInt(response.status, 10) >= 400) {
               failures.push(url);
             } else {
               var dataPoint = {
                 x: program.revision,
                 y: millis,
                 name: url,
                 line: {shape: "spline"},
                 type: 'scatter'
               };

               var traceIndex = existingTraces.indexOf(url);
               if (traceIndex !== -1) {
                 updatedTraces.push(dataPoint);
                 updatedTraceKeys.push(traceIndex);
               } else {
                 newTraces.push(dataPoint);
               }
             }
         })
         .fail(function(err) {
             console.log(err);
             failures.push(url);
         }));
  });

  Q.all(requests).then(function() {
     if (failures.length > 0) {
         console.log('FAILED URLs:')
         console.log(failures);
     }
     var graph_layout = {
       xaxis: {
         type: 'category',
         title: 'Commit'
       },
       yaxis: {
         title: 'Response time (ms)'
       }
     };

     var plotNewTraces = function() {
       if (newTraces.length) {
         plotly.plot(newTraces, {
           layout: graph_layout,
           filename: config.plot.filename,
           fileopt: 'append'
         }, function(err, msg) {
            console.log(msg);
            if (err) {
              console.log("Error plotting graph:");
              console.log(err);
              process.exit(1);
            } else {
              process.exit(failures.length);
            }
         });
       } else {
         process.exit(failures.length);
       }
     };

     if (updatedTraces.length) {
       console.log('updating', updatedTraceKeys);
       plotly.plot(updatedTraces, {
         layout: graph_layout,
         filename: config.plot.filename,
         fileopt: 'extend',
         traces: updatedTraceKeys
       }, function(err, msg) {
         if (err) {
           console.log("Error plotting graph:");
           console.log(err);
           process.exit(1);
         } else {
           console.log(msg);
           plotNewTraces();
         }
       });
     } else {
       plotNewTraces();
     }

  }).fail(function(err) {
     console.log('Error');
     console.log(err);
     process.exit(1);
  });
});
