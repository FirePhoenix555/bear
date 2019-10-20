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
let IPs = [];

let fbd = false;

io.sockets.on('connection', socket => {
    socket.on("DELETE_HIGHSCORE",data => {scores.splice(data-1,1); scoreRef.set(scores);});
    socket.on("ADD_GAME",()=>{database.ref("Games Played").set(gameCount+1);});
    // let ip = socket.request.connection.remoteAddress.substring(7);
    // if (!ip) ip = "127.0.0.1";
    // if (!IPs.includes(ip)) IPs.push(ip);
    // if (fbd) {
    //     database.ref("Unique Users").set(IPs.length);
    //     database.ref("uq").set(IPs.join(","));
    // }

    var ip = req.headers["x-forwarded-for"];
    if (ip){
        var list = ip.split(",");
        ip = list[list.length-1];
    } else {
        ip = req.connection.remoteAddress;
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
        console.log({uniqueUsers:userCount,gamesPlayed:gameCount});
        socket.emit("loadData",{uniqueUsers:userCount,gamesPlayed:gameCount});
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
let userCount = -1;
let gameCount = -1;

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

function updateUsers(data2) {
    data2.on("value", data => {
        let f = data.val();
        userCount = f;
    });
};

updateUsers(uniqueUsers);

function updateGames(data2) {
    data2.on("value", data => {
        let f = data.val();
        gameCount = f;
    });
};

updateGames(gamesPlayed);

function updateIPs(data2) {
    data2.on("value", data => {
        IPs = data.val().split(",");
    })
    fbd = true;
}

updateIPs(database.ref("uq"));