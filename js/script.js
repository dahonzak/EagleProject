// ------------ Copywrite Dominik Honzak (c) 2024 ------------ //
//Created Entirely from scratch by Dominik Honzak//
const replaceGit = "/EagleProject"; /* /EagleProject 
*/
const basic = {
  maps:null,
  colors:["white","yellow","orange","brown","green","red","blue"],
  navcon:true,
  timer:null
};
let shareData = {
  title: "Takoma Park Orienteering",
  text: "",
  url: document.URL,
};
const page = {
  tab:0
};
let orienteering;
 
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

const mapArray = document.getElementById("maps");
// ----------------- mapdetails ----------------- //
const mapDetails = {
  name: document.getElementById("mapname"),
  display: document.getElementById("mapdisplay"),
  detail: document.getElementById("mapdetail")
};
const course = document.getElementById('course');
const testing = document.getElementById('testing');
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
const newGame = function() {
  localStorage.clear();
  location.reload();
};

const loadMaps = function() {
  for (let i = 0; i < basic.maps.length; i++) {
    let map = document.createElement("div");
    map.classList.add("mapselect");
    if (!basic.maps[i]["Picture"]) {
      map.style.background = "url("+replaceGit+"/images/icon.png)";
    }
    else {
      map.style.background = "url(" + basic.maps[i]["Picture"] + ")";
    }
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
    map.onclick = function() {loadMap(i);orienteering["currentControl"] = 0;};
    mapArray.appendChild(map);
  }
};
const loadMap = function(i) {
  orienteering["course"] = basic.maps[i]["Name"];
  orienteering["difficulty"] = basic.maps[i]["Difficulty"];
  orienteering["length"] = calcDistance(basic.maps[i]["Controls"]);
  orienteering["currentMap"] = basic.maps[i]["Map"];
  orienteering["courseindex"] = i;
  mapDetails.name.textContent = orienteering["course"];
  if (!basic.maps[i]["Map"]) {
    mapDetails.display.src = replaceGit+"/images/icon.png";
  }
  else {
    mapDetails.display.src = basic.maps[i]["Map"];
  }

  mapDetails.detail.innerHTML = "";
  tab(3);
  
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
  footer.textContent = "Accuracy: " + position.coords.accuracy.toFixed(2) + "m";
  if (orienteering.hasOwnProperty("mapstarted") && orienteering["mapstarted"]) {
    orienteering["avgAccuracy"].push(position.coords.accuracy);
    orienteering["cords"].push(position.coords.latitude + "," + position.coords.longitude);
    orienteering["cordstime"].push(new Date().getTime());
    orienteering["distance"] = calcDistance(orienteering["cords"]);
    orienteering["elevation"].push(position.coords.altitude);
  }
  if (position.coords.accuracy >= 15) {
    footer.style.background = "red";
  }
  else {
    footer.style.background = "var(--colorIn)";
  }
};
const getPosition = function(position) {
  let currentLat = position.coords.latitude.toFixed(4); 
  let currentLong = position.coords.longitude.toFixed(4); 
  
  let [targetLat, targetLong] = basic.maps[orienteering.courseindex].Controls[orienteering.currentControl].split(",").map(coord => parseFloat(coord).toFixed(4)); 
  let accuracy = 0.0002;
  let withinAccuracy = Math.abs(currentLat - targetLat) <= accuracy && Math.abs(currentLong - targetLong) <= accuracy; 
  
  if (withinAccuracy) { //position.coords.accuracy <= 15 &&
    //success
    orienteering["Controls"].push({ "Control": targetLat+","+targetLong, "Timestamp": new Date().getTime() });
    if (orienteering["currentControl"] == 0) {
      startCourse();
    }
    else if (orienteering["currentControl"] == basic.maps[orienteering["courseindex"]]["Controls"].length - 1) {
      endCourse();
    }
    orienteering["currentControl"]++;
    if (orienteering["currentControl"] < basic.maps[orienteering["courseindex"]]["Controls"].length) {
    tab(7);
    setTimeout(function() {
      tab(6);
    },3500);
    }
    else {
      tab(4);
    }
  }
  else { 
    testing.innerHTML = ("Off by lat ± "+Math.abs(currentLat - targetLat).toFixed(4)+" long ± "+Math.abs(currentLong - targetLong).toFixed(4));
    tab(8);
    setTimeout(function() {
      tab(6);
    },3500);
  }
  basic.navcon = true;
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
  if (navigator.geolocation && basic.navcon) {
    basic.navcon = false;
    navigator.geolocation.getCurrentPosition(getPosition, showError,{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
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
  basic.timer = setInterval(function(){
    updateCourseInfo();
    orienteering["time"]++;
  },1000);
  // create a localstorage item to store the course and data
  //opens course timer and starts course with time stamps
};
const endCourse = function() {
  tab(4);
  basic.timer = clearInterval(basic.timer);
  orienteering["mapstarted"] = false;
  orienteering["endtime"] = new Date().getTime();
  let cc = ((orienteering["endtime"]-orienteering["starttime"])/1000);
  let cc1 = parseInt(cc%60);
  if (cc1 <= 9) {cc1 = "0" + cc1;}
  
  shareData.text = "Course: "+orienteering["course"]+"\n\nDistance: "+orienteering["distance"].toFixed(1)+" km\nTime: "+(parseInt(cc/60)+':'+cc1);
  localStorage.clear();
  //ends course and calculates time and accuracy then dislays the information on the screen
};
const repeating = function() {
  getLocation();
  if (orienteering.hasOwnProperty("mapstarted") && orienteering["mapstarted"]) {
localStorage.setItem("Course",JSON.stringify(orienteering)); 
  }
}
setInterval(repeating,5000);
const loadCourse = function() {
   document.getElementById("courseName_on").textContent = orienteering["course"];
  document.getElementById("courseControlLength_on").textContent = (basic.maps[orienteering["courseindex"]]["Controls"].length-2);
  document.getElementById("courseDistance_on").textContent = orienteering["length"].toFixed(1)+" km";
  document.getElementById("courseDifficulty_on").style.background = basic.colors[orienteering["difficulty"]];
};
const openOptions = function() {
  tab(9);
};
const updateCourseInfo = function() {
  let cc = orienteering["time"];
  let cc1 = parseInt(cc%60);
  if (cc1 <= 9) {cc1 = "0" + cc1;}
  document.getElementsByClassName('time')[0].textContent = (parseInt(cc/60)+':'+cc1);
  if (orienteering["currentControl"] == 0) {
    document.getElementsByClassName('control')[0].textContent = "Start";
  }
  else if (orienteering["currentControl"] == (basic.maps[orienteering["courseindex"]]["Controls"].length - 1)) {
    document.getElementsByClassName('control')[0].textContent = "Finish";
  }
  else {
    document.getElementsByClassName('control')[0].textContent = orienteering["currentControl"];
  }
  if (orienteering["distance"]) {
    document.getElementsByClassName('distance')[0].textContent = orienteering["distance"].toFixed(1)+" km";
  }
};



// -------------load in stuff------------ //

const sharebtn = document.getElementById("shareButton");
sharebtn.addEventListener("click", async () => {
  try {
    await navigator.share(shareData);
    sharebtn.textContent = "Shared!";
  } catch (err) {
    alert("error sharing");
  }
});

const resumeCourse = function() {
  tab(6);loadCourse();
  basic.timer = setInterval(function(){
    updateCourseInfo();
    orienteering["time"]++;
  },1000);
};
readTextFile(replaceGit+"/json/maps.json",function(responseText) {
basic.maps = JSON.parse(responseText)["Maps"];
  if (!(localStorage.getItem("Course") === null)) {
  if (JSON.parse(localStorage.getItem("Course"))["course"]) {
    orienteering = JSON.parse(localStorage.getItem("Course"));
    loadMap(orienteering["courseindex"]);
    resumeCourse();
  }
  }
  else {
    orienteering = JSON.parse(`{
        "course":"",
        "courseindex":null,
        "difficulty":0,
        "distance":0.0,
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
  }
  loadMaps();

});
