// ------------ Copywrite Dominik Honzak (c) 2024 ------------ //
//Created Entirely from scratch by Dominik Honzak, no AI was used nor any other 3rd party tools to write the code.//
const basic = {
  maps:null,
  colors:["white","yellow","orange","brown","green","red","blue"]
};
const page = {
  tab:0
};
const orienteering = JSON.parse(`{
  "course":"",
  "courseindex":null,
  "difficulty":0,
  "distance":0,
  "length":0,
  "time":0,
  "Controls":[],
  "currentControl":0,
  "currentMap":"",
  "cords":[],
  "cordstime":[],
  "avgAccuracy":[],
  "mapstarted":false,
  "elevation":[],
  "starttime":0,
  "endtime":0
}`);
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
readTextFile("/EagleProject/json/maps.json",function(responseText) {
basic.maps = JSON.parse(responseText)["Maps"];loadMaps();});
const mapArray = document.getElementById("maps");
// ----------------- mapdetails ----------------- //
const mapDetails = {
  name: document.getElementById("mapname"),
  display: document.getElementById("mapdisplay"),
  detail: document.getElementById("mapdetail")
};
const course = document.getElementById('course');
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
  for (let i = 0; i < map.length; i++) {
    if (i > 0) {
      let lat1 = toRad(map[i].split(",")[0]);
      let lon1 = toRad(map[i].split(",")[1]);
      let lat2 = toRad(map[i-1].split(",")[0]);
      let lon2 = toRad(map[i-1].split(",")[1]);
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
    mapLength.textContent = calcDistance(basic.maps[i]["Controls"]).toFixed(1)+" km";
    map.appendChild(mapLength);
    map.onclick = function() {
      orienteering["course"] = basic.maps[i]["Name"];
      orienteering["difficulty"] = basic.maps[i]["Difficulty"];
      orienteering["length"] = calcDistance(basic.maps[i]["Controls"]);
      orienteering["Controls"] = basic.maps[i]["Controls"];
      orienteering["currentControl"] = 0;
      orienteering["currentMap"] = basic.maps[i]["Map"];
      orienteering["courseindex"] = i;
      mapDetails.name.textContent = orienteering["course"];
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
const downloadMap = async function() {
  const image = await fetch(orienteering["currentMap"]);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);
  const link = document.createElement('a')
  link.href = imageURL;
  link.download = "Map";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const printMap = function() {
  let popup = window.open(orienteering["currentMap"],"_blank");
  popup.focus();
  popup.print();
};
const showPosition = function(position) {
  const footer = document.getElementsByClassName("footer")[0];
  footer.textContent = " Accuracy: " + position.coords.accuracy.toFixed(2) + "m";
  if (orienteering["mapstarted"]) {
    orienteering["avgAccuracy"].push(position.coords.accuracy);
    orienteering["cords"].push(position.coords.latitude + "," + position.coords.longitude);
    orienteering["cordstime"].push(new Date().getTime());
    orienteering["distance"] = calcDistance(orienteering["cords"]);
    orienteering["elevation"].push(position.coords.altitude);
    updateCourseInfo();
    orienteering["time"]++;
  }
  if (position.coords.accuracy >= 15) {
    footer.style.background = "red";
  }
  else {
    footer.style.background = "var(--colorIn)";
  }
};
const getPosition = function(position) {
  let current = position.coords.latitude.toFixed(4) + "," + position.coords.longitude.toFixed(4);
  let target = parseFloat(basic.maps[orienteering["courseindex"]]["Controls"][orienteering["currentControl"]].split(",")[0]).toFixed(4) + "," + parseFloat(basic.maps[orienteering["courseindex"]]["Controls"][orienteering["currentControl"]].split(",")[1]).toFixed(4);
  if (position.coords.accuracy <= 15 && current == target) {
    //success
    orienteering["Controls"].push({ "Control": target, "Timestamp": new Date().getTime() });
    if (orienteering["currentControl"] == 0) {
      startCourse();
    }
    else if (orienteering["currentControl"] == basic.maps[orienteering["courseindex"]]["Controls"].length-1) {
      endCourse();
    }
    orienteering["currentControl"]++;
    tab(7);
    setTimeout(function() {
      tab(6);
    },3500);
  }
  else {
    tab(8);
    setTimeout(function() {
      tab(6);
    },3500);
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
const checkLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition, showError,{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
};
const resumeCourse = function() {
  orienteering = JSON.parse(localStorage.getItem("Course"));
  
};
const startCourse = function() {
  orienteering["cords"] = [];
  orienteering["avgAccuracy"] = [];
  orienteering["mapstarted"] = true;
  orienteering["currentControl"] = 0;
  orienteering["distance"] = 0;
  orienteering["time"] = 0;
  orienteering["elevation"] = [];
  orienteering["starttime"] = new Date().getTime();
  // create a localstorage item to store the course and data
  //opens course timer and starts course with time stamps
};
const endCourse = function() {
  orienteering["mapstarted"] = false;
  orienteering["endtime"] = new Date().getTime();
  //ends course and calculates time and accuracy then dislays the information on the screen
};
const repeating = function() {
  getLocation();
  localStorage.setItem("Course",JSON.stringify(orienteering)); 
}
const loadCourse = function() {
  course.innerHTML = "<h1>" + orienteering["course"] + "</h1><h2>Controls: " + (orienteering["Controls"].length-2) +" | Distance: " + orienteering["length"].toFixed(1) + " km | Difficulty: " + basic.colors[orienteering["difficulty"]].toUpperCase() + "</h2>";
  let control = document.createElement('div');
  control.classList.add("control");
  control.textContent = "Start";
  course.appendChild(control);
  let time = document.createElement('h1');
  time.classList.add("time");
  time.textContent = "00:00";
  course.appendChild(time);
  let distance = document.createElement('div');
  distance.classList.add("distance");
  distance.textContent = "0.0 km";
  course.appendChild(distance);
  let confirmbtn = document.createElement('div');
  confirmbtn.classList.add("button","mainPageBtn");
  confirmbtn.textContent = "Confirm";
  confirmbtn.onclick = function() {checkLocation();};
  course.appendChild(confirmbtn);
  
};
const updateCourseInfo = function() {
  let cc = orienteering["time"];
  let cc1 = parseInt(cc%60);
  if (cc1 <= 9) {cc1 = "0" + cc1;}
  document.getElementsByClassName('time')[0].textContent = (parseInt(cc/60)+':'+cc1);
  document.getElementsByClassName('control')[0].textContent = orienteering["currentControl"]+1;
  document.getElementsByClassName('distance')[0].textContent = orienteering["distance"].toFixed(1)+" km";
};
setInterval(repeating,1000);


// -------------load in stuff------------ //

