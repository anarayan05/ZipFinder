//CURRENT: Plotted volatility. Least volatile (FOR NOW)
  //Volatility fixed
  //Note: Top least volatile high density areas are the same as top 200 highest growth areas
  //Possibly do an intersection of standard growth with it after fixed
  //Explore adding retailer data

//GOAL: Add component where you can visualize the the high growth areas, with low and high volatility 

const hd = document.getElementById("hd");
const md = document.getElementById("md");
const ld = document.getElementById("ld");
const standard = document.getElementById("standard");
const volatility = document.getElementById("volatilty");
const map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const shapeLayer = L.layerGroup().addTo(map);
let st_mode = true; //default standard plot
let dataCache = null;

fetch('city_data.json')
  .then(function(response) {
    return response.json(); // parse JSON
  })
  .then((data) =>{
    dataCache = data;
    addListeners();
  })
  .catch(function(err) {
    console.error('Failed to load JSON:', err); // json unable to load error
  });

standard.addEventListener('change', ()=> {
    if(standard.checked){
        st_mode = true;
    }
});

volatility.addEventListener('change', () =>{
    if(volatility.checked){
        st_mode = false;
    }
})

function addListeners(){
  hd.addEventListener("click", () => {
    //condition for standard plot
    let filtered_data = dataCache.filter(item => item.density >= 5_000);
    let sorted_data;
    if(st_mode){
      sorted_data = sortTop200(filtered_data, true);
      plotCircles(sorted_data, "hd", true);
    }
    else{
      sorted_data = sortTop200(filtered_data, false);
      plotCircles(sorted_data, "hd", false);
    }
  });
  md.addEventListener("click", () => {
    let filtered_data = dataCache.filter(item => item.density < 5_000 && item.density >= 1_000);
    let sorted_data;
    if(st_mode){
      sorted_data = sortTop200(filtered_data, true);
      plotCircles(sorted_data, "md", true);
    }
    else{
      sorted_data = sortTop200(filtered_data, false);
      plotCircles(sorted_data, "md", false);
    }
  });
  ld.addEventListener("click", () => {
    let filtered_data = dataCache.filter(item => item.density < 1_000);
    let sorted_data;
    if(st_mode){
      sorted_data = sortTop200(filtered_data, true);
      plotCircles(sorted_data, "ld", true);
    }
    else{
      sorted_data = sortTop200(filtered_data, false);
      plotCircles(sorted_data, "ld", false);
    }
  });
}


function plotCircles(data, density, is_standard){
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
      if(is_standard){
        circle_color = generateColor(density, growth_score[i]); //generate color using the density
        console.log(growth_score[i]);
      }
      else{
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

function sortTop200(data, is_standard){
  //sorts the top 200 of the portion of data based on the shade score given
  //bubble sorting (swapping pairs)
  if(is_standard){
    return data.sort((a, b) => 
    {return b.color_score - a.color_score;}).slice(0,200); //sorting by HIGHEST growth
  }
  else{
    return data.sort((a, b) => 
    {return a.Growth_Volatility  - b.Growth_Volatility ;}).slice(0,200); //sorting by LEAST volatile
  }
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
