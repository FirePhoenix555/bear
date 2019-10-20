require("dotenv").config();

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
    // let ip = socket.request.connection.remoteAddress.substring(7);
    // if (!ip) ip = "127.0.0.1";
    
    let ip = socket.request.headers["x-forwarded-for"];

    if (ip) {
        let list = ip.split(",");
        ip = list[list.length - 1];
    } else {
        ip = socket.request.connection.remoteAddress;
        if (!ip || ip == "::1") ip = "127.0.0.1";
    }

    if (!IPs.includes(ip)) IPs.push(ip);

    if (fbd) {
        uniqueUsers.set(IPs.length);
        uniqueIPs.set(IPs.join(","));
    }

    // console.log("Socket = " + socket.id + ", IP: " + ip);

    let d = new Date();

    let a = function(t) {
        if (t > 12) {
            return [t - 12, true];
        } else {
            return [t, false];
        }
    }

    let onh = a(d.getHours());
    console.log("[" + onh[0] + ":" + d.getMinutes() + " " + (onh[1] ? "PM" : "AM") + "] [" + socket.id.substring(16) + "] Connection from " + ip);

    socket.on("DELETE_HIGHSCORE", data => {
        scores.splice(data - 1, 1);
        scoreRef.set(scores);
    });

    socket.on("ADD_GAME", () => {
        gamesPlayed.set(gameCount + 1);
    });

    socket.on("score", data => {
        socket.emit("received");
        console.log("New high score of " + data.score + " by '" + (data.name || "Anonymous") + "'! They would like to say '" + data.message + "'");
        saveScore(data);
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
        // console.log({
        //     uniqueUsers: userCount,
        //     gamesPlayed: gameCount
        // });

        socket.emit("loadData", {
            uniqueUsers: userCount,
            gamesPlayed: gameCount
        });
    })
});

function saveScore(data) {
    scores.push(data);
    scores.sort((a, b) => b.score - a.score);
    scoreRef.set(scores);
}

const firebaseConfig = {
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
const uniqueIPs = database.ref("uq");

let userCount = -1;
let gameCount = -1;

function updateRef(ref, f) {
    ref.on("value", data => {
        f(data.val());
    });
}

updateRef(scoreRef, v => {
    scores.length = 0;
    if (!v) return;
    let keys = Object.keys(v);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        scores.push(v[key]);
    }
});

updateRef(uniqueUsers, v => {
    userCount = v;
});

updateRef(gamesPlayed, v => {
    gameCount = v;
});

updateRef(uniqueIPs, v => {
    let t = v.split(",");
    for (let i = 0; i < t.length; i++) {
        if (!IPs.includes(t[i])) IPs.push(t[i]);
    }
    uniqueIPs.set(IPs.join(","));

    fbd = true;
});