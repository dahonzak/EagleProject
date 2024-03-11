const basic = {
  maps:null,
  colors:["white","yellow","orange","brown","green","red","blue"]
};
const page = {
  tab:0
};
const orienteering = {
  course:"",
  difficulty:0,
  distance:0,
  time:0,
  controls:[], //{"Control":"s6df57asdf6","Timestamp":0}
  currentControl:0
};
const readTextFile = function(file,callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
};
readTextFile("/json/maps.json",function(responseText) {
basic.maps = JSON.parse(responseText)["Maps"]});
const mapArray = document.getElementById("maps");

// ----------------end of initilization-------------------- //

const tab = function(tab) {
  const classes = document.getElementsByClassName("tab");
  const shown = document.getElementsByClassName("show");
  shown[0].classList.remove("show");
  classes[tab].classList.add("show");
  page.tab = tab;
};
const loadMaps = function() {
  for (let i = 0; i < maps.length; i++) {
    let map = document.createElement("div");
    map.classList.add("mapselect");
    let mapName = document.createElement("div");
    mapName.classList.add("mapname");
    mapName.textContent = maps[i]["Name"];
    map.appendChild(mapName);
    let mapDiff = document.createElement("div");
    mapDiff.classList.add("mapdiff");
    mapDiff.style.background = basic.colors[maps[i]["Difficulty"]];
    map.appendChild(mapDiff);
    let mapLength = document.createElement("div");
    mapLength.classList.add("maplength");
    mapLength.textContent = maps[i]["Length"];
    map.appendChild(mapLength);
    mapArray.appendChild(map);
  }
};
const loadMap = function(map) {
  
};

// -------------load in stuff------------ //

loadMaps();
