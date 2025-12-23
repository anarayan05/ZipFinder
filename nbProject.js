//CURRENT:
  //Volatility fixed
  //Note: Top least volatile high density areas are the same as top 200 highest growth areas
  //Possibly do an intersection of standard growth with it after fixed
  //Explore adding retailer data

//TODO:
  //define all data before addListeners() function
  //incorperate overlapped data for overlap mode

//GOAL: Add component where you can visualize the the high growth areas, with low and high volatility 

const hd = document.getElementById("hd");
const md = document.getElementById("md");
const ld = document.getElementById("ld");
const standard = document.getElementById("standard");
const volatility = document.getElementById("volatilty");
const overlap = document.getElementById("overlap");
const map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const shapeLayer = L.layerGroup().addTo(map);
let mode = "standard"; //default standard plot

//declare all data before addListeners() function
let dataCache;

let hd_data, hd_growth, hd_volatility, hd_overlap;
let md_data, md_growth, md_volatility, md_overlap;
let ld_data, ld_growth, ld_volatility, ld_overlap;

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

    md_data = dataCache.filter(item => item.density < 5_000 && item.density >= 1_000);
    md_growth = sortTop200(md_data, "standard");
    md_volatility = sortTop200(md_data, "volatility");
    md_overlap = overlapData(md_growth, md_volatility);

    ld_data = dataCache.filter(item => item.density < 1_000);
    ld_growth = sortTop200(ld_data, "standard");
    ld_volatility = sortTop200(ld_data, "volatility");
    ld_overlap = overlapData(ld_growth, ld_volatility);

    addListeners();
  })
  .catch(function(err) {
    console.error('Failed to load JSON:', err); // json unable to load error
  });

standard.addEventListener('change', ()=> {
    if(standard.checked){
        mode = "standard";
    }
});

volatility.addEventListener('change', () =>{
    if(volatility.checked){
        mode = "volatility";
    }
})

overlap.addEventListener('change', () =>{
    if(overlap.checked){
        mode = "overlap";
    }
});

function addListeners(){
  hd.addEventListener("click", () => {
    //condition for standard plot
    let sorted_data;
    if(mode == "standard"){
      sorted_data = hd_growth;
      plotCircles(sorted_data, "hd", "standard");
    }
    else if(mode == "volatility"){
      sorted_data = hd_volatility;
      plotCircles(sorted_data, "hd", "volatility");
    }
    else if(mode == "overlap"){
      sorted_data = hd_overlap;
      console.log(sorted_data.length);
      plotCircles(sorted_data, "hd", "overlap");
    }
  });
  md.addEventListener("click", () => {
    let sorted_data;
    if(mode == "standard"){
      sorted_data = md_growth;
      plotCircles(sorted_data, "md", "standard");
    }
    else if(mode == "volatility"){
      sorted_data = md_volatility;
      plotCircles(sorted_data, "md", "volatility");
    }
    else if(mode == "overlap"){
      sorted_data = md_overlap;
      console.log(sorted_data.length);
      plotCircles(sorted_data, "md", "overlap");
    }
  });
  ld.addEventListener("click", () => {
    let sorted_data;
    if(mode == "standard"){
      sorted_data = ld_growth;
      plotCircles(sorted_data, "ld", "standard");
    }
    else if(mode == "volatility"){
      sorted_data = ld_volatility;
      plotCircles(sorted_data, "ld", "volatility");
    }
    else if(mode == "overlap"){
      sorted_data = ld_overlap;
      console.log(sorted_data.length);
      plotCircles(sorted_data, "ld", "overlap");
    }
  });
}


function plotCircles(data, density, mode){
  shapeLayer.clearLayers() //clear shapes so nothing overlaps for different buttons
  let allZips = data.map(obj => obj.Zip);
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
      if(mode == "standard"){
        circle_color = generateColor(density, growth_score[i]); //generate color using the density
      }
      else if(mode == "volatility"){
        circle_color = generateColor(density, vol_score[i]);
      }
      else if(mode == "overlap"){
        circle_color = generateColor(density, vol_score[i]);
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
