//create popups for the markers
const hd = document.getElementById("hd");
const md = document.getElementById("md");
const ld = document.getElementById("ld");
const map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const shapeLayer = L.layerGroup().addTo(map);

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
  let allCities = data.map(obj => obj.City); // get all Cities
  let metro = data.map(obj => obj.Metro);
  let population = data.map(obj => obj.population);
  let num_density = data.map(obj => obj.density);
  let color_scores = data.map(obj => obj.color_score);
  let lat = data.map(obj => obj.lat);
  let long = data.map(obj => obj.long);
  for(var i = 0;i < data.length; i++){
    console.log(color_scores[i])
    console.log(allZips[i])
      let circle_color = generateColor(density, color_scores[i]); //generate color using the density
      const circle = L.circle([lat[i], long[i]], {
          color: circle_color,
          fillColor: circle_color,
          fillOpacity: 0.7,
          radius: 500
      }).addTo(shapeLayer);
      circle.bindPopup(`ZipCode: ${allZips[i]}<br>City: ${allCities[i]}<br>Metro: ${metro[i]}
        <br>Population: ${population[i]}<br>Population Density: ${num_density[i]}<br>
        Relative Growth Score: ${ Math.round(color_scores[i] * 1000) / 1000}`);
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
    }
    else{
      color = `rgb(${value * 255}, 0, 0)`;
    }
    return color;
}
