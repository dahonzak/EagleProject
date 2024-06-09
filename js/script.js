// ------------ Copywrite Dominik Honzak (c) 2024 ------------ //
//Created Entirely from scratch by Dominik Honzak//


const replaceGit = "/EagleProject"; /* /EagleProject 
*/
const basic = {
  maps:null,
  colors:["white","yellow","orange","beige","brown","green","red","blue"],
  colordef:["Easy","Normal","Intermediate","Intermediate Long","Advanced","Advanced Long","Expert","Expert Long"],
  colorhue:["rgb(255,255,255)","rgb(247, 237, 47)","rgb(255, 153, 0)","rgb(117, 107, 75)","rgb(92, 63, 34)","rgb(19, 191, 42)","rgb(209, 15, 15)","rgb(46, 125, 209)"],
  navcon:true,
  timer:null,
  hotcold: false,
  hotcolden:0
};
let shareData = {
  title: "Takoma Park Orienteering",
  text: "",
  url: document.URL,
};
const page = {
  tab:0,
  blur:false,
  warning:false
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
const resultsPage = {
  controls: document.getElementById("courseControlLength_off"),
  distance: document.getElementById("courseDistance_off"),
  elevation: document.getElementById("courseElevation_off"),
  split: document.getElementById("courseSplit_off")
};
const mapFilter = {
  type: document.getElementById("filter_name"),
  display: document.getElementById("filtered")
};
const course = document.getElementById('course');
const testing = document.getElementById('testing');
// ----------------end of initilization-------------------- //
const changeBg = function(bg) {
  document.querySelector(':root').style.setProperty('--bg', "url("+replaceGit+"/images/"+bg+") no-repeat fixed center center");
};
const tab = function(tab) {
  const classes = document.getElementsByClassName("tab");
  const shown = document.getElementsByClassName("show");
  shown[0].classList.remove("show");
  classes[tab].classList.add("show");
  page.tab = tab;
  switch (tab) {
    case 0:
      changeBg("bg.png");
      break;
    case 10:
      changeBg("water.jpg");
      break;
  };
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
const calculateDistance = function(latitude1, longitude1, latitude2, longitude2) {
  const EARTH_RADIUS = 6371e3; // Earth radius in meters
  const phi1 = toRad(latitude1);
  const phi2 = toRad(latitude2);
  const deltaPhi = toRad(latitude2 - latitude1);
  const deltaLambda = toRad(longitude2 - longitude1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS * c;
  return distance;
};
const toRad = function(Value) {
    return Value * Math.PI / 180;
};
const warning = function(h,p,f) {
  let currentW = "";
  if (!(localStorage.getItem("Warnings") === null)) {
    currentW = localStorage.getItem("Warnings");
  }
  if (!page.warning && !currentW.includes(h)) {
    if (f) {
      localStorage.setItem("Warnings",currentW+","+h);
    }
    page.warning = true;
    let dis = document.createElement("div");
    dis.classList.add("perm");
    let header = document.createElement("h3");
    header.textContent = h;
    dis.appendChild(header);
    let para = document.createElement("p");
    para.innerHTML = p;
    dis.appendChild(para);
    let btn = document.createElement("div");
    btn.classList.add("button");
    btn.textContent = "Dismiss";
    btn.onclick = function() {
      dis.remove();
      page.warning = false;
    };
    dis.appendChild(btn);
    document.body.appendChild(dis);
  }
};
const newGame = function() {
  localStorage.clear();
  location.reload();
};
const openMap = function() {
  window.open(orienteering["currentMap"], '_blank');
};
const loadMaps = function() {
  let maplevels = document.createElement("div");
  for (let i = 0; i < basic.colors.length; i++) {
    let type = document.createElement("div");
    type.classList.add("type");
    type.style.background = basic.colorhue[i];
    type.innerHTML = basic.colors[i].charAt(0).toUpperCase() + basic.colors[i].slice(1) + " (" + basic.colordef[i] + ")";
    type.onclick = "mapFiltering("+i+")";
    maplevels.appendChild(type);
  }
  mapArray.appendChild(maplevels);
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
    mapDiff.style.background = basic.colorhue[basic.maps[i]["Difficulty"]];
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
    mapDetails.display.src = replaceGit+"/images/soon.jpg";
  }
  else {
    mapDetails.display.src = basic.maps[i]["Map"];
  }

  mapDetails.detail.innerHTML = "";
  tab(3);
  
};
const mapFiltering = function(filter) {
  mapFilter.type = basic.colors[filter].charAt(0).toUpperCase() + basic.colors[filter].slice(1) + " (" + basic.colordef[filter] + ")";
  mapFilter.display.innerHTML = "";
  let counter = 0;
  for (let i = 0; i < basic.maps.length; i++) {
    if (basic.maps[i]["Difficulty"] == filter) {
      counter++;
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
      mapDiff.style.background = basic.colorhue[basic.maps[i]["Difficulty"]];
      map.appendChild(mapDiff);
      let mapLength = document.createElement("div");
      mapLength.classList.add("maplength");
      mapLength.textContent = calcDistance(basic.maps[i]["Controls"]).toFixed(1)+" km";
      map.appendChild(mapLength);
      map.onclick = function() {loadMap(i);orienteering["currentControl"] = 0;};
      mapFilter.display.appendChild(map);
    }
  }
  if (counter == 0) {
    mapFilter.display.innerHTML = "No maps found";
  }
  tab(13);
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
  if (orienteering && orienteering["mapstarted"] && (position.coords.accuracy <= 15)) {
    orienteering["avgAccuracy"].push(position.coords.accuracy);
    orienteering["cords"].push(position.coords.latitude + "," + position.coords.longitude);
    orienteering["cordstime"].push(new Date().getTime());
    orienteering["distance"] = calcDistance(orienteering["cords"]);
    orienteering["elevation"].push(position.coords.altitude);
    hotCold(calcDistance([(position.coords.latitude+", "+position.coords.longitude),basic.maps[orienteering["courseindex"]]["Controls"][orienteering["currentControl"]]])*1000);
    
  }
  if (position.coords.accuracy >= 15) {
    footer.style.background = "red";
  }
  else {
    footer.style.background = "var(--colorIn)";
  }
};
const toSP = function(x) {
    if (x.toString().includes("e")) {
        x = parseFloat(x.toString().split("e")[0]) * Math.pow(10, parseFloat(x.toString().split("e")[1]));
    }
    return x.toFixed(6);
};
const getPosition = function(position) {
  let currentLat = position.coords.latitude; 
  let currentLong = position.coords.longitude; 
  
  let [targetLat, targetLong] = basic.maps[orienteering.courseindex].Controls[orienteering.currentControl].split(",").map(coord => parseFloat(coord));
   
/* 
solution 1
let accuracyLat = (accuracy/(2*Math.PI*6371000*Math.cos(toRad(targetLat))/360)).toFixed(6); // 0.0000089 = 1 meter
  let accuracyLong = (accuracy/(2*Math.PI*6371000*Math.cos(toRad(targetLat)))).toFixed(9); //0.000000025 = 1 meter
  let withinAccuracy = Math.abs(toRad(currentLat) - toRad(targetLat)) <= accuracyLat && Math.abs(toRad(currentLong) - toRad(targetLong)) <= accuracyLong; */
  
  /* 
  solution 2
  let accuracy = 10;
  //the code I was using before
  let withinAccuracy = calculateDistance(currentLat,currentLong,targetLat,targetLong) <= accuracy && position.coords.accuracy <= 15;*/
  
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
    
     testing.innerHTML = ("off by: "+calculateDistance(currentLat,currentLong,targetLat,targetLong)+`m<div onclick='warning("Cords","`+currentLat.toFixed(6)+", "+currentLong.toFixed(6)+` <br> `+targetLat.toFixed(6)+", "+targetLong.toFixed(6)+`",false);'>testing</div>`);
    if (!(position.coords.accuracy <= 15)) {
      tab(11);
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
  }
  basic.navcon = true;
};
const showError = function(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      break;
    case error.POSITION_UNAVAILABLE:
      break;
    case error.TIMEOUT:
      break;
    case error.UNKNOWN_ERROR:
      break;
  }
  warning("Location Request","Your device likely does not have location services enabled.</p><b class='grey'>IOS: </b>aA → Settings → Scroll Down → Location → Allow<br><b class='grey'>Android: </b>⋮ → Scroll Down → ⓘ → Permissions → Location → On",true);
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
};
const endCourse = function() {
  orienteering["starttime"] -= (orienteering["bonustime"]*1000);
  tab(4);
  basic.timer = clearInterval(basic.timer);
  orienteering["mapstarted"] = false;
  orienteering["endtime"] = new Date().getTime();
  let cc = ((orienteering["endtime"]-orienteering["starttime"])/1000);
  let cc1 = parseInt(cc%60);
  if (cc1 <= 9) {cc1 = "0" + cc1;}
  
  shareData.text = "Course: "+orienteering["course"]+"\n\nDistance: "+orienteering["distance"].toFixed(1)+" km\nTime: "+(parseInt(cc/60)+':'+cc1);
  document.getElementsByClassName('time')[0].textContent = "Time: "+(parseInt(cc/60)+':'+cc1);
  resultsPage.controls.textContent = orienteering["Controls"].length;
  resultsPage.distance.textContent = orienteering["distance"].toFixed(1)+" / "+ orienteering["length"].toFixed(1)+ " km";
  resultsPage.elevation.textContent = orienteering["elevation"].reduce((acc, curr) => acc + curr, 0).toFixed(1) + "m";
  resultsPage.split.textContent = Math.round(cc / (orienteering["Controls"].length - 1)) + "s";


  localStorage.clear();
};
const repeating = function() {
  getLocation();
  if (orienteering && orienteering["mapstarted"]) {
localStorage.setItem("Course",JSON.stringify(orienteering)); 
  }
}
setInterval(repeating,5000);
const loadCourse = function() {
   document.getElementById("courseName_on").textContent = orienteering["course"];
  document.getElementById("courseControlLength_on").textContent = (basic.maps[orienteering["courseindex"]]["Controls"].length-2);
  document.getElementById("courseDistance_on").textContent = orienteering["length"].toFixed(1)+" km";
  document.getElementById("courseDifficulty_on").style.background = basic.colorhue[orienteering["difficulty"]];
  warning("Warning","We suggest that you refrain from staring at your phone while doing the course as this may result in injury. Be aware that some controls are placed off of paths. Conditions such as weather may impact how dangerous a course is. <b>Please be aware that this website sometimes does not work.</b>",true);
};
const openOptions = function() {
  tab(9);
};
const updateCourseInfo = function() {
  let cc = orienteering["time"];
  let cc1 = parseInt(cc%60);
  if (cc1 <= 9) {cc1 = "0" + cc1;}
  document.getElementsByClassName('time')[1].textContent = (parseInt(cc/60)+':'+cc1);
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
const dropdown = function(e) {
 if (e.getElementsByTagName("p1")[0].style.display == "none") {
   e.getElementsByTagName("p1")[0].style.display = "block";
   e.getElementsByTagName("h3")[0].style.borderRadius = "10px 10px 0px 0px";
 }
 else {
   e.getElementsByTagName("p1")[0].style.display = "none";
   e.getElementsByTagName("h3")[0].style.borderRadius = "10px";
 }
};
const sharebtn = document.getElementById("shareButton");
sharebtn.addEventListener("click", async () => {
  try {
    await navigator.share(shareData);
    sharebtn.textContent = "Shared!";
  } catch (err) {
    alert("error sharing");
  }
});
const pauseCourse = function() {
  if (basic.timer) {
    clearInterval(basic.timer);
    basic.timer = null;
  }
};
const resumeCourse = function() {
  if (orienteering["mapstarted"]) {
    tab(6);loadCourse();
    orienteering["time"] = (new Date().getTime() - orienteering["starttime"])/1000;
    basic.timer = setInterval(function(){
      updateCourseInfo();
      orienteering["time"]++;
    },1000);
  }
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
        "endtime":0,
        "bonustime":0
      }`);
  }
  loadMaps();

});
window.addEventListener("focus", function(event) 
{ 
  if (page.blur) {
    resumeCourse();
    page.blur = false;
  }
}, false);
window.addEventListener("blur", function(event) { 
  pauseCourse();
  page.blur = true;
}, false);

let elem = document.documentElement;
const openFullscreen = function() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
};

const closeFullscreen = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
};
 const hotcoldmode = function() {
   if (basic.hotcold && basic.hotcolden != orienteering["currentControl"]) {
     basic.hotcold = !basic.hotcold;
     document.querySelector(':root').style.setProperty('--bg_overlay', "rgba(0,0,0,0.65)");
   }
   else if (basic.hotcolden != orienteering["currentControl"]) {
     basic.hotcolden = orienteering["currentControl"];
     basic.hotcold = !basic.hotcold;
     orienteering["bonustime"] += 120; // extra seconds
     warning("HC Mode On","Hot Cold Mode Enabled, 2 min have been added. How to use?: Red means you are closer to control and blue indicates you are further away. This feature is only available while your phone is on and in addition will only work for this control.",false);
     tab(6);
   }
 };
const hotCold = function(dist) {
  if (basic.hotcold) {
    let rgb = {
      r:0,
      g:0,
      b:0
    };
  
    if (Math.round(dist) >= 255 && Math.round(dist) <= 510) {
      rgb.b = 255 - Math.round(dist);
    }
    else if (Math.round(dist) <= 255) {
      rgb.r = 255 - Math.round(dist);
    }
    document.querySelector(':root').style.setProperty('--bg_overlay', "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.65)");
    //change background overlay color
  }
};