
const express = require('express');
const firebase = require('firebase');
const app = express();
const server = app.listen(3000);
const socket = require('socket.io');
const io = socket(server);

app.use(express.static('public'));

console.log("Running...");

let scores = [];

io.sockets.on('connection', socket => {
    socket.emit("GET_COOKIE",{cookie:"JOINED_BEFORE"});
    socket.on("DELETE_HIGHSCORE",data => {scores.splice(data-1,1); scoreRef.set(scores);});
    socket.on("REQUESTED_COOKIE",data => {
        if (!data){
            database.ref("Unique Users").set(userCount+1);
            socket.emit("SET_COOKIE",{name:"JOINED_BEFORE",value:true});
        }
    });
    socket.on("ADD_GAME",()=>{database.ref("Games Played").set(gameCount+1);});
    let ip = socket.request.connection.remoteAddress.substring(7);
    if (!ip) ip = "127.0.0.1";
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

const firebaseConfig = {
    apiKey: "AIzaSyDcg9L6wzN77Fsjj1UKX1cWvWqW-sPyV0U",
    authDomain: "bear-98732.firebaseapp.com",
    databaseURL: "https://bear-98732.firebaseio.com",
    projectId: "bear-98732",
    storageBucket: "bear-98732.appspot.com",
    messagingSenderId: "636832213365",
    appId: "1:636832213365:web:18eaa1c696254650"
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