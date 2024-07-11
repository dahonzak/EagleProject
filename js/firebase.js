import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
const firebaseConfig = {
  apiKey: "AIzaSyDROBDZ1MZfFiY0Yn54w9LVmDHsY0AJvmQ",
  authDomain: "takoma-park-orienteering.firebaseapp.com",
  databaseURL: "https://takoma-park-orienteering-default-rtdb.firebaseio.com",
  projectId: "takoma-park-orienteering",
  storageBucket: "takoma-park-orienteering.appspot.com",
  messagingSenderId: "654127400915",
  appId: "1:654127400915:web:cf14fa1308c6c5666ad126",
  measurementId: "G-1X0MRPN1C8"
};

import {getDatabase, set, get, update, remove, ref, child} 
from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"
try {
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

const insertData = function(orienteering, warning) {
  if (orienteering["endtime"] != 0 && orienteering["skips"] == 0) {
    set(ref(db, orienteering["course"]+"/"+(orienteering["name"]+new Date().getTime())), {
      Name:orienteering["name"],
      Time:(orienteering["endtime"]-orienteering["starttime"]+orienteering["bonustime"])
    }).then(() => {
      warning("Course Complete","Your course has been saved to the database.",false);
      localStorage.clear();
    }).catch((error) => {
      console.error("Error saving to database:", error);
      alert("An error occurred: " + error.message);
    });
  }
  else {
    warning("Course Complete","Your course was not saved. Skips: "+orienteering["skips"],false);
    localStorage.clear();
  }
};
window.insertData = insertData;
const requestData = function(course) {
//request from firebase for leaderboard
  const leaderboardtitle = document.getElementById("leaderboardtitle");
  leaderboardtitle.textContent = course;
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = "";
  const dbref = ref(db);
  get(child(dbref, course)).then((snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
         let courseList = [];
          Object.values(data).forEach((value) => {
              courseList.push({
                  Name: value.Name,
                  Time: value.Time
              });
          });
        let sortedlist = courseList.sort((a, b) => (a.Time) - (b.Time));
        for (let r = 0; r < sortedlist.length; r++) {
          let rank = r + 1;
          const row = document.createElement('div');
          row.classList.add('row');
          const rankDiv = document.createElement('div');
          rankDiv.classList.add('rank');
          rankDiv.textContent = rank;
          const name = document.createElement('div');
          name.classList.add('name');
          name.textContent = sortedlist[r].Name;
          const time = document.createElement('div');
          time.classList.add('timelead');
          time.textContent = `${Math.floor((sortedlist[r].Time) / 60000)}: ${Math.round(((sortedlist[r].Time) % 60000) / 1000)}`;
          row.appendChild(rankDiv);
          row.appendChild(name);
          row.appendChild(time);
          leaderboard.appendChild(row);
        }
      } else {
          leaderboard.innerHTML = "No data found.";
      }
  });
};
window.requestData = requestData;
} catch(error) {
  console.error("Error initializing Firebase:", error);
};