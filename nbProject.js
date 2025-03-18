//sql wasm js file taken care of in html
//Things are good so far, but make it so that you can create queries without densities too
//maybe explore other databases with different variables
//Also make output and markers on map

let submit = document.getElementById("submit");
let city = document.getElementById("city");
let density = document.getElementById("density");
let state = document.getElementById("states");
let region = document.getElementById("region");
let output = document.getElementById("output");

//database;
let db;

const northeast = ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"];
const midwest = ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"];
const south = ["Alabama", "Arkansas", "Delaware", "Florida", "Georgia", "Kentucky", "Louisiana", "Maryland", "Mississippi", "North Carolina", "South Carolina", "Tennessee", "Texas", "Virginia", "West Virginia"];
const southwest = ["Arizona", "New Mexico", "Oklahoma", "Texas"];
const northwest = ["Idaho", "Montana", "Oregon", "Washington", "Wyoming"];



submit.addEventListener("click", submitClicked);

function addRegionToQuery(region){
    let regionList = [];
    switch(region) {
        case "Northeast":
          regionList = northeast;
          break;
        case "Midwest":
            regionList = midwest;
          break;
          case "South":
            regionList = south;
          break;
        case "Southwest":
            regionList = southwest;
          break;
          case "Northwest":
            regionList = northwest;
          break;
        default:
            regionList = northeast;
      }
    
    return regionList.map(state => `STATE = '${state}'`).join(" OR ");
}

function capitalize(word){
    return word.charAt(0).toUpperCase()+word.slice(1);
}

async function loadDatabase() {
    try {
        // Fetch the database file as binary data
        const response = await fetch('/nb.db');
        const buffer = await response.arrayBuffer();
        
        // Initialize SQL.js once the database file is fetched
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });
        
        // Create the database instance
        db = new SQL.Database(new Uint8Array(buffer));

        const tableInfo = db.exec("PRAGMA table_info(your_table_name);");
        console.log("Table Info:", tableInfo); // Log table info to check structure
        
        console.log("Database Loaded");
    } catch (error) {
        console.error("Failed to load or initialize the database:", error);
    }
}

//returning for now when selections invalid

function submitClicked(){
    let d = parseInt(density.value);
    if(isNaN(d) || d<0){
        console.log("Density Value Was Not A Valid Number");
        return;
    }
    let query = `SELECT Coordinates, Zip, City, State FROM your_table_name WHERE density BETWEEN ${d - (0.1 * d)} AND ${d + (0.1 * d)}`;
    if(String(city.value.trim()) !== ''){
        query += ` AND City = '${city.value}'`;
    }
    if(String(state.value)!="none"){
        query += ` AND St = '${capitalize(state.value)}'`;
    }
    if(String(region.value)!='none'){
        if(String(state.value)==="N/A"){
            query += ` AND (${addRegionToQuery(region.value)})`;
        }
    }   
    query+=" LIMIT 10;"
    console.log(query);
    let result = db.exec(query);
    console.log(result); // Log result to the console

}

loadDatabase();