// ############# Build the initial dashboard ##################
function init() {
  // Grab a reference to the dropdown select element
      var dropdown = d3.select("#selDataset");

      // Use the list of sample names to populate the select options
      d3.json("/names").then((sampleNames) => {
          console.log(sampleNames)
          sampleNames.forEach((sample) => {
            dropdown
              .append("option")
              .text(sample)
              .property("value", sample);
      });

    //     // Use the first sample from the list to build the initial plots
      var firstSample = parseInt(sampleNames[0]);
      console.log(firstSample);
      buildCharts(firstSample);
      buildMetadata(firstSample);
      });
};

// Fetch new data each time a new sample is selected
function optionChanged(newSample) {
  buildCharts(parseInt(newSample));
  buildMetadata(parseInt(newSample));
};

//##################################################################
// ######### Build Panel #############

function buildMetadata(sample) {
    var url_meta = `/metadata/${sample}`;
    // Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    d3.json(url_meta).then(success,error);

    function error(error){
        console.warn(error);
    };

    function success(result){
        console.log(result);
        // Use d3 to select the panel with id of `#sample-metadata`
        var panel = d3.select("#sample-metadata");
        // Use `.html("") to clear any existing metadata
        panel.html("");
        console.log(Object.entries(result));
        // Use `Object.entries` to add each key and value pair to the panel
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(result).forEach(row=>{
          panel.append("p").text(`${row[0]}: ${row[1]}`);
        // Object.entries(result).forEach(([key, value]) => {
        //   panel.append('p').text(`${key}: ${value}`)
        });
    };
};
  

//###################################################################################
  //######### Build Charts ###############

 // Use `d3.json` to fetch the sample data for the plots
 function buildCharts(sample) {
      var url_sample = `/samples/${sample}`;
      d3.json(url_sample).then(successHandle, errorHandle)
  
      function successHandle(response){
          // console.log(response);

          //  Build a Pie Chart
          // HINT: You will need to use slice() to grab the top 10 sample_values,
          // otu_ids, and labels (10 each).
          var data_pie = [{
            "labels":response.otu_ids.slice(0,10),
            "values":response.sample_values.slice(0,10),
            "type":"pie",
            "hoverinfo":'response.otu_labels.slice(0,10) + percent'
          }];
          console.log(data_pie);
          var layout_pie = {
            height: 500,
            width: 600
          };
          Plotly.newPlot("pie",data_pie,layout_pie);

         
          // Build a bubble Chart
          var data_bubble = [{
            "x": response.otu_ids,
            "y": response.sample_values,
            "mode":"markers",
            "marker":{
                      "size": response.sample_values.map(d=>d*10),
                      "sizemode":"area",
                      "color":response.otu_ids,
                      "colorscale": "Earth"
                    },
            "text":response.otu_labels,
          }];
          console.log(data_bubble);
          var layout_bubble = {
            // height: 800,
            // width: 1500,
            hovermode: 'closest',
            xaxis: { title: 'OTU ID',
                      autorange: true },
            yaxis: { title: 'Sample Values',
                      autorange: true }
          };
          Plotly.newPlot("bubble",data_bubble,layout_bubble);

      };

      function errorHandle(error){
          console.warn(error);
      };

 };





// ##############################################################################

// Initialize the dashboard
init();
 