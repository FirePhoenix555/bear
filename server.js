require("dotenv").config()

const express = require('express');
const firebase = require('firebase');
const app = express();
const server = app.listen(process.env.PORT || 3000);
const socket = require('socket.io');
const io = socket(server);

app.use(express.static('public'));

console.log("Running...");

let scores = [];

io.sockets.on('connection', socket => {
    socket.on("DELETE_HIGHSCORE",data => {scores.splice(data-1,1); scoreRef.set(scores);});
    socket.on("ADD_GAME",()=>{database.ref("Games Played").set(gameCount+1);});
    let ip = socket.request.connection.remoteAddress.substring(7);
    if (!ip) ip = "127.0.0.1";
    let ipExists = false;
    for (let i = 0; i < userIPs.split(",").length; i++) {
        if (userIPs.split(",")[i] === ip){
            ipExists = true;
        }
    }
    if (ipExists === false){
        console.log("IP "+ip+" added to IP list.");
        if (userIPs === ""){
            userIPs = ip;
        }
        else{
            userIPs += ","+ip;
        }
        ipRef.set(userIPs);
    }
    console.log("Socket = " + socket.id+", IP: "+ip);
    socket.on("score", data => {
        // console.log("fdsdfs");
        socket.emit("received", null);
        console.log("New high score of " + data.score + " by '" + (data.name || "Anonymous") + "'! They would like to say '" + data.message + "'");
        saveScore(data);
        // this is here in case something needs to be done to the data before saveScore
    });

    socket.on("reqScores", () => {
        let sc = {};
        for (let i = 0; i < ((scores.length > 10) ? 10 : scores.length); i++) {
            sc["" + (i + 1)] = scores[i];
        }
        socket.emit("loadscores", sc);
    });

    socket.on("reqScores1", () => {
        let sc = {};
        for (let i = 0; i < ((scores.length > 10) ? 10 : scores.length); i++) {
            sc["" + (i + 1)] = scores[i];
        }
        socket.emit("loadscores1", sc);
    });
    socket.on("reqData", () => {
        console.log({uniqueUsers:userIPs.split(",").length,gamesPlayed:gameCount});
        socket.emit("loadData",{uniqueUsers:userIPs.split(",").length,gamesPlayed:gameCount});
    })
});

function saveScore(data) {
    scores.push(data);
    scores.sort((a, b) => b.score - a.score);
    scoreRef.set(scores);
}

const firebaseConfig = { //process.env.
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const scoreRef = database.ref("High Scores");
const uniqueUsers = database.ref("Unique Users");
const gamesPlayed = database.ref("Games Played");
const ipRef = database.ref("Unique IPs");
let gameCount = -1;
let userIPs = "";

function updateIPs(data2) {
    data2.on("value", data => {
        let f = data.val();
        userIPs = f;
    });
};

updateIPs(ipRef);

function updateScores(data2) {
    data2.on("value", data => {
        scores.length = 0;
        let dta = data.val();
        if (!dta) return;
        let keys = Object.keys(dta);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            scores.push(dta[key]);
        }
    });
};

updateScores(scoreRef);

function updateGames(data2) {
    data2.on("value", data => {
        let f = data.val();
        gameCount = f;
    });
};

updateGames(gamesPlayed);