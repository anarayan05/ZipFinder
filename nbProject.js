//CURRENT:
  //Preliminary AI data filter implemented
  //Note: Top least volatile high density areas are the same as top 200 highest growth areas

//TODO:
  //Make AI data filter querying system more accurate and robust
  //Make filtering (applyFilters) less dependent on the dataIndex structure and more on entire data
  //Explore adding user inputs for top n zip codes instead of just top 200, maybe radius around zip code etc...
  //Explore adding different retailers or energy/utility cost data for zip codes

//MAIN GOAL: AI Data Filter querying system for users

const hd = document.getElementById("hd");
const md = document.getElementById("md");
const ld = document.getElementById("ld");
const standard = document.getElementById("standard");
const volatility = document.getElementById("volatility");
const retailer = document.getElementById("retailer");
const plot = document.getElementById("plot");
const ai = document.getElementById("ai"); //ai buttoon to switch mode NOT submit button
const userInput = document.getElementById("textbox");
const submitBtn = document.getElementById("submit");
const standardLabel = document.getElementById("standardLabel");
const volatilityLabel = document.getElementById("volatilityLabel");
const retailerLabel = document.getElementById("retailerLabel");

//initialize map
const map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const shapeLayer = L.layerGroup().addTo(map);
let mode = "standard"; //default standard plot
let density = "hd"; //default high density
let aiMode = false; //default ai mode off

//declare all data before addListeners() function  - high density, moderate density, low density
// combined with standard, volatility, overlap, retailer
let dataCache;
let dataIndex; //to store all indexed data for easy access later

let hd_data, hd_growth, hd_volatility, hd_overlap, hd_retailer, hd_growth_retailer, hd_volatility_retailer, hd_overlap_retailer;
let md_data, md_growth, md_volatility, md_overlap, md_retailer, md_growth_retailer, md_volatility_retailer, md_overlap_retailer;
let ld_data, ld_growth, ld_volatility, ld_overlap, ld_retailer, ld_growth_retailer, ld_volatility_retailer, ld_overlap_retailer;

const modes = "standard, volatility, overlap, retailer, standard retailer, volatility retailer, overlap retailer";

fetch('city_data.json')
  .then(function(response) {
    return response.json(); // parse JSON
  })
  .then((data) =>{
    dataCache = data;
    //initialize all data for each listener event
    hd_data = dataCache.filter(item => item.density >= 5_000);
    hd_growth = sortTop200(hd_data, "standard");
    hd_volatility = sortTop200(hd_data, "volatility");
    hd_overlap = overlapData(hd_growth, hd_volatility);
    hd_retailer = hd_data.filter(item => item.Walmart_Presence == 1);
    hd_growth_retailer = hd_growth.filter(item => item.Walmart_Presence == 1);
    hd_volatility_retailer = hd_volatility.filter(item => item.Walmart_Presence == 1);
    hd_overlap_retailer = hd_overlap.filter(item => item.Walmart_Presence == 1);

    md_data = dataCache.filter(item => item.density < 5_000 && item.density >= 1_000);
    md_growth = sortTop200(md_data, "standard");
    md_volatility = sortTop200(md_data, "volatility");
    md_overlap = overlapData(md_growth, md_volatility);
    md_retailer = md_data.filter(item => item.Walmart_Presence == 1);
    md_growth_retailer = md_growth.filter(item => item.Walmart_Presence == 1);
    md_volatility_retailer = md_volatility.filter(item => item.Walmart_Presence == 1);
    md_overlap_retailer = md_overlap.filter(item => item.Walmart_Presence == 1);

    ld_data = dataCache.filter(item => item.density < 1_000);
    ld_growth = sortTop200(ld_data, "standard");
    ld_volatility = sortTop200(ld_data, "volatility");
    ld_overlap = overlapData(ld_growth, ld_volatility);
    ld_retailer = ld_data.filter(item => item.Walmart_Presence == 1);
    ld_growth_retailer = ld_growth.filter(item => item.Walmart_Presence == 1);
    ld_volatility_retailer = ld_volatility.filter(item => item.Walmart_Presence == 1);
    ld_overlap_retailer = ld_overlap.filter(item => item.Walmart_Presence == 1);

    //store indexed data in dict type for easy access later

    dataIndex = {
      hd: {
        "standard": hd_growth,
        "volatility": hd_volatility,
        "overlap": hd_overlap,
        "retailer": hd_retailer,
        "standard retailer": hd_growth_retailer,
        "volatility retailer": hd_volatility_retailer,
        "overlap retailer": hd_overlap_retailer
      },
      md: {
        "standard": md_growth,
        "volatility": md_volatility,
        "overlap": md_overlap,
        "retailer": md_retailer,
        "standard retailer": md_growth_retailer,
        "volatility retailer": md_volatility_retailer,
        "overlap retailer": md_overlap_retailer
      },
      ld: {
        "standard": ld_growth,
        "volatility": ld_volatility,
        "overlap": ld_overlap,
        "retailer": ld_retailer,
        "standard retailer": ld_growth_retailer,
        "volatility retailer": ld_volatility_retailer,
        "overlap retailer": ld_overlap_retailer
      }
    };
  })
  .catch(function(err) {
    console.error('Failed to load JSON:', err); // json unable to load error
  });

//adding event listeners to checkboxes and buttons
standard.addEventListener('change', updateMode);

volatility.addEventListener('change', updateMode);

retailer.addEventListener('change', updateMode);

hd.addEventListener('click', updateDensity);

md.addEventListener('click', updateDensity);

ld.addEventListener('click', updateDensity);

//plot button event listener
plot.addEventListener('click', plotClicked);

ai.addEventListener('click', aiClicked);

submitBtn.addEventListener('click', AISubmit);

//default high density button selected style
hd.style.borderColor = "black";
hd.style.borderWidth = "3px";

//update mode for all possible data layer combinations
function updateMode() {
    if(standard.checked && volatility.checked && retailer.checked){
        mode = "overlap retailer";
        console.log("overlap retailer");
    }
    else if(standard.checked && retailer.checked){
        mode = "standard retailer";
        console.log("standard retailer");
    }
    else if(volatility.checked && retailer.checked){
        mode = "volatility retailer";
        console.log("volatility retailer");
    }
    else if(standard.checked && volatility.checked){
        mode = "overlap";
        console.log("overlap");
    }
    else if(retailer.checked){
        mode = "retailer";
        console.log("retailer");
    }
    else if(volatility.checked){
        mode = "volatility";
        console.log("volatility");
    }
    else{
        mode = "standard";
        console.log("standard");
    }
}

//update density mode and button styles
function updateDensity(e) {
    if(e.target == hd) {
        density = "hd";
        hd.style.borderColor = "black";
        hd.style.borderWidth = "3px";
        md.style.borderColor = "";
        md.style.borderWidth = "";
        ld.style.borderColor = "";
        ld.style.borderWidth = "";
    }
    else if(e.target == md) {
        density = "md";
        md.style.borderColor = "black";
        md.style.borderWidth = "3px";
        hd.style.borderColor = "";
        hd.style.borderWidth = "";
        ld.style.borderColor = "";
        ld.style.borderWidth = "";
    }
    else if(e.target == ld) {
        density = "ld";
        ld.style.borderColor = "black";
        ld.style.borderWidth = "3px";
        hd.style.borderColor = "";
        hd.style.borderWidth = "";
        md.style.borderColor = "";
        md.style.borderWidth = "";
    }
}

//checking all conditions for plotting
function plotClicked(){
    //using indexed data for easy access
    const dataToPlot = dataIndex[density][mode];
    plotCircles(dataToPlot, density, mode);
}

function aiClicked(){
    aiMode = !aiMode;
    if(aiMode){
        ai.style.backgroundColor = "lightgreen";
        hd.style.opacity = 0;
        md.style.opacity = 0;
        ld.style.opacity = 0;
        standard.style.opacity = 0;
        volatility.style.opacity = 0;
        retailer.style.opacity = 0;
        plot.style.opacity = 0;
        userInput.style.opacity = 1;
        submitBtn.style.opacity = 1;
        standardLabel.style.opacity = 0;
        volatilityLabel.style.opacity = 0;
        retailerLabel.style.opacity = 0;
    }
    else{
        ai.style.backgroundColor = "";
        hd.style.opacity = 1;
        md.style.opacity = 1;
        ld.style.opacity = 1;
        standard.style.opacity = 1;
        volatility.style.opacity = 1;
        retailer.style.opacity = 1;
        plot.style.opacity = 1;
        userInput.style.opacity = 0;
        submitBtn.style.opacity = 0;
        standardLabel.style.opacity = 1;
        volatilityLabel.style.opacity = 1;
        retailerLabel.style.opacity = 1;
    }
}

function plotCircles(data, density_mode, mode){
  shapeLayer.clearLayers() //clear shapes so nothing overlaps for different buttons
  let allZips = data.map(obj => obj.Zip); //error here
  let allCities = data.map(obj => obj.City); // get all Cities
  let metro = data.map(obj => obj.Metro);
  let population = data.map(obj => obj.population);
  let num_density = data.map(obj => obj.density);
  let growth_score = data.map(obj => obj.color_score);
  let vol_score = data.map(obj => obj.Growth_Volatility);

  //the condition if it is in standard or volatility mode

  let lat = data.map(obj => obj.lat);
  let long = data.map(obj => obj.long);
  for(var i = 0;i < data.length; i++){
      let circle_color;
      if(mode.includes("standard")){
        circle_color = generateColor(density_mode, growth_score[i]); //generate color using the density
      }
      else if(mode.includes("volatility") || mode.includes("overlap")){
        circle_color = generateColor(density_mode, vol_score[i]);
      }
      else if(mode == "retailer"){
        circle_color = `rgb(255, 165, 0)`; //orange color for retailer locations
      }
      const circle = L.circle([lat[i], long[i]], {
          color: circle_color,
          fillColor: circle_color,
          fillOpacity: 0.7,
          radius: 500
      }).addTo(shapeLayer);
      //adding popup to circle with relevant info
      circle.bindPopup(`ZipCode: ${allZips[i]}<br>City: ${allCities[i]}<br>Metro: ${metro[i]}
        <br>Population: ${population[i]}<br>Population Density (/sq mi): ${num_density[i]}<br>
        Relative Growth Score (0 - 1): ${Math.round(growth_score[i] * 1000) / 1000}
        <br>Growth Volatility Score (0 - 1): ${Math.round(vol_score[i] * 1000) / 1000}`);
  }
}

function sortTop200(data, mode){
  //sorts the top 200 of the portion of data based on the shade score given
  //bubble sorting (swapping pairs)
  if(mode == "standard"){
    return data.sort((a, b) => 
    {return b.color_score - a.color_score;}).slice(0,200); //sorting by HIGHEST growth
  }
  else if(mode == "volatility"){
    return data.sort((a, b) => 
    {return a.Growth_Volatility  - b.Growth_Volatility ;}).slice(0,200); //sorting by LEAST volatile
  }
}

function overlapData(growthData, volatilityData){
  let overlap_data = [];
  for(let i = 0; i < growthData.length; i++){
    //finds some volatility data that has the same zip code for each growth data
    if(volatilityData.some(item => item.Zip === growthData[i].Zip)){
      overlap_data.push(growthData[i]);
    }
  }
  return overlap_data;
}

//generating each primary color for each density variation
function generateColor(density, value){
  let color = ``;
    if(density == "hd"){
        color = `rgb(0, 0, ${value * 255})`;
    }
    else if(density == "md"){
        color = `rgb(0, ${value * 255}, 0)`;
    }
    else{
      color = `rgb(${value * 255}, 0, 0)`;
    }
    return color;
}

//ai button submit handler
async function AISubmit() {
    const input = userInput.value.trim();
    if (!input) {
        alert('Please enter a query');
        return;
    }
    submitBtn.value = 'Processing...';
    try {
        const filters = await parseUserQuery(input);
        console.log('AI Filters:', filters); //seeing the filters generated
        const filteredData = applyFilters(filters);
        plotCircles(filteredData, filters.density, filters.mode);
    } catch (error) {
        console.error('AI filter error:', error);
        alert('Error processing your query.');
    } finally {
        submitBtn.value = 'Submit';
    }
}

//ai response and query generator for filtering data
async function parseUserQuery(userQuery) {
    const response = await fetch("https://zipfinder-iazj.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery })
    }); //fetch to connect to backend server
    const data = await response.json();
    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
}

function applyFilters(filters) {
    return dataIndex[filters.density][filters.mode];
}
