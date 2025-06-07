//do the mapping for cities of different density ranges and create buttons for them
const hd = document.getElementById("hd");
const md = document.getElementById("md");
const ld = document.getElementById("ld");
const map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const shapeLayer = L.layerGroup().addTo(map);


// const allCities = data.map(obj => obj.City); // get all Cities
// const metro = data.map(obj => obj.Metro);
// const population = data.map(obj => obj.population);
// const density = data.map(obj => obj.density);

fetch('city_data.json')
  .then(function(response) {
    return response.json(); // parse JSON
  })
  .then((data) =>{
    hd.addEventListener("click", () => {
      let filtered_data = data.filter(item => item.density >= 5_000);
      let sorted_data = sortTop200(filtered_data);
      plotCircles(sorted_data, "hd")
    })
    md.addEventListener("click", () => {
      let filtered_data = data.filter(item => item.density < 5_000 && item.density >= 1_000);
      let sorted_data = sortTop200(filtered_data);
      plotCircles(sorted_data, "md")
    })
    ld.addEventListener("click", () => {
      let filtered_data = data.filter(item => item.density < 1_000);
      let sorted_data = sortTop200(filtered_data);
      plotCircles(sorted_data, "ld")
    })
  })
  .catch(function(err) {
    console.error('Failed to load JSON:', err); // json unable to load error
  });

function plotCircles(data, density){
  shapeLayer.clearLayers() //clear shapes so nothing overlaps for different buttons
  let allZips = data.map(obj => obj.Zip);
  let color_scores = data.map(obj => obj.color_score);
  let lat = data.map(obj => obj.lat);
  let long = data.map(obj => obj.long);
  for(var i = 0;i < data.length; i++){
    console.log(color_scores[i])
    console.log(allZips[i])
      let circle_color = generateColor(density, color_scores[i]); //generate color using the density
      L.circle([lat[i], long[i]], {
          color: circle_color,
          fillColor: circle_color,
          fillOpacity: 0.7,
          radius: 500
      }).addTo(shapeLayer);
  }
}

function sortTop200(data){
  //sorts the top 200 of the portion of data based on the shade score given
    return data.sort((a, b) => 
    {return b.shade_score - a.shade_score;}).slice(0,200);
}

function generateColor(density, value){
  let color = ``;
    if(density == "hd"){
        color = `rgb(0, 0, ${value * 255})`;
    }
    else if(density == "md"){
        color = `rgb(0, ${value * 255}, 0)`;
        console.log("hi");
    }
    else{
      color = `rgb(${value * 255}, 0, 0)`;
    }
    return color;
}
