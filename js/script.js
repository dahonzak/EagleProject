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
basic.maps = JSON.parse(responseText)["Maps"];loadMaps();});
const mapArray = document.getElementById("maps");
// ----------------- mapdetails ----------------- //
const mapDetails = {
  name: document.getElementById("mapname"),
  display: document.getElementById("mapdisplay"),
  detail: document.getElementById("mapdetail")
};
// ----------------end of initilization-------------------- //

const tab = function(tab) {
  const classes = document.getElementsByClassName("tab");
  const shown = document.getElementsByClassName("show");
  shown[0].classList.remove("show");
  classes[tab].classList.add("show");
  page.tab = tab;
};
const calcDistance = function(map) {
  let distance = 0.0;
  for (let i = 0; i < map["Controls"].length; i++) {
    if (i > 0) {
      let lat1 = toRad(map["Controls"][i].split(",")[0]);
      let lon1 = toRad(map["Controls"][i].split(",")[1]);
      let lat2 = toRad(map["Controls"][i-1].split(",")[0]);
      let lon2 = toRad(map["Controls"][i-1].split(",")[1]);
      distance += (Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1))*6371);
    }
  }
  return distance;
};
const toRad = function(Value) {
    return Value * Math.PI / 180;
};
const loadMaps = function() {
  for (let i = 0; i < basic.maps.length; i++) {
    let map = document.createElement("div");
    map.classList.add("mapselect");
    map.style.background = "url(" + basic.maps[i]["Picture"] + ")";
    map.style.backgroundSize = "cover";
    let mapName = document.createElement("div");
    mapName.classList.add("mapname");
    mapName.textContent = basic.maps[i]["Name"];
    map.appendChild(mapName);
    let mapDiff = document.createElement("div");
    mapDiff.classList.add("mapdiff");
    mapDiff.style.background = basic.colors[basic.maps[i]["Difficulty"]];
    map.appendChild(mapDiff);
    let mapLength = document.createElement("div");
    mapLength.classList.add("maplength");
    mapLength.textContent = calcDistance(basic.maps[i]).toFixed(1)+" km";
    map.appendChild(mapLength);
    map.onclick = function() {
      orienteering.course = basic.maps[i]["Name"];
      orienteering.difficulty = basic.maps[i]["Difficulty"];
      orienteering.distance = calcDistance(basic.maps[i]);
      orienteering.controls = basic.maps[i]["Controls"];
      orienteering.currentControl = 0;
      mapDetails.name.textContent = orienteering.course;
      mapDetails.display.src = basic.maps[i]["Map"];
      mapDetails.detail.innerHTML = "";
      tab(3);
    };
    mapArray.appendChild(map);
  }
};
const loadMap = function(map) {
  // load page where you can download and share map as well as start the course
};
const downloadMap = async function(map) {
  const image = await fetch(map);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);
  const link = document.createElement('a')
  link.href = imageURL;
  link.download = "Map";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const showPosition = function(position) {
  const footer = document.getElementsByClassName("footer")[0];
  footer.textContent = " Accuracy: " + position.coords.accuracy.toFixed(2) + "m";
  if (position.coords.accuracy >= 50) {
    footer.style.background = "red";
  }
  else {
    footer.style.background = "var(--colorIn)";
  }
};
const showError = function(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      location.href='/error';
      break;
    case error.POSITION_UNAVAILABLE:
      location.href='/error';
      break;
    case error.TIMEOUT:
      location.href='/error';
      break;
    case error.UNKNOWN_ERROR:
      location.href='/error';
      break;
  }
};
const getLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError,{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
};
const startCourse = function() {
  //opens course timer and starts course with time stamps
};
setInterval(getLocation,1000);


// -------------load in stuff------------ //


