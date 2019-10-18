
/*
TODO
Audrey
- eat pie

Alex
- eat pie

Overall
OPTIONAL
- sounds (corn starch is good for snow)

NOT OPTIONAL
- how to play (ADD 'click to skip animations')
- polish
- submit
*/

let wlr = 0.000125;
let year = 0;
let startingYear = 2019;
let totalYears = 25;
let setScore = 0;

const socket = io();

let mother;
let sealCoords = [];
let player;
let grid;
let waterLevel = 0;
let setWaterLevel = false;

let deathAnimationLength = 100;
let deathAnimationTimer = 0;

let score = 0;
let scores = {};

/*
socket.emit("score",{});
socket.emit("reqScores",null);
*/

let animation = false;
let animationNum;
const animations = [];
let skipped = false;
let ended = false;

let menu = false;
let scene = 0;

let waiting = false;

let tx = 0;

let canvas;

const SPRITES = [];
const TRASH = [];
let fish = null;
let fishes = [];

let motherImg = null;
let sealie = null;

let gamesPlayed;
let uniqueUsers;

let txGens = [];

const SPEED = 0.6;
const SIZE  = 25;
const ROUGH = 3;

let fishCoords = [];
let trashCoords = [];

let ofs;

let pregrid = [];
let preWaterLevel = 0;

socket.on("SET_COOKIE", data => {
    document.cookie=data.name+"="+data.value+";";
});

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

socket.on("GET_COOKIE", data => {
    socket.emit("REQUESTED_COOKIE",getCookie(data.cookie));
});

socket.on("ALERT", data => {
    alert(data);
});

socket.on("loadData", data => {
    gamesPlayed = data.gamesPlayed;
    uniqueUsers = data.uniqueUsers;
})

socket.on("loadscores", data => {
    scores = data;
});

socket.on("loadscores1", data => {
    scores = data;
    if ((!scores["10"] || (player.score > scores["10"].score)) /* && this.score > 2466 */) {
        player.nhs = true;
    }
})

socket.on("received", () => {
    waiting = false;
    console.log("");
})

socket.emit("reqScores", null);

function preload() {
    SPRITES[0] = createImg("assets/polar-bear/standing.gif");
    SPRITES[1] = createImg("assets/polar-bear/up.gif");
    SPRITES[2] = createImg("assets/polar-bear/left.gif");
    SPRITES[3] = createImg("assets/polar-bear/down.gif");
    SPRITES[4] = createImg("assets/polar-bear/right.gif");

    for (let i = 0; i < SPRITES.length; i++) {
        SPRITES[i].hide();
    }

    TRASH[0] = loadImage("assets/trash/plastic-bottle.png");
    TRASH[1] = loadImage("assets/trash/plastic-straw.png");
    TRASH[2] = loadImage("assets/trash/plastic-pellets.png");
    TRASH[3] = loadImage("assets/trash/plastic-bag.png");
    TRASH[4] = loadImage("assets/trash/plastic-spork.png");

    fish = createImg("assets/fish.gif");
    fish.hide();

    motherImg = loadImage("assets/mother.png");
    sealie = loadImage("assets/seal.png");
}

function setup() {
    //canvas = createCanvas(SIZE * floor(windowWidth / SIZE) || 500, SIZE * floor(windowHeight / SIZE) || 500);
    canvas = createCanvas(windowWidth,windowHeight);

    player = new Player(floor(width / (2 * SIZE)) * SIZE + SIZE / 2, floor(height / (2 * SIZE)) * SIZE + SIZE / 2);

    frameRate(30);
    animations[0] = document.getElementById("anim0");
    animations[1] = document.getElementById("anim1");

    for (let i = 0; i < animations.length; i++) {
        animations[i].onended = function() {
            ended = true;
        }
    }

    rectMode(CENTER);
    imageMode(CENTER);
    textSize(50);
    menu = true;

    preGrid = generateGrid(floor(width / SIZE), floor(height / SIZE), random(500, 1000));
}

function draw() {
    if (waiting) console.log("waiting");
    if (menu) {
        // draw the menu
        background(255);

        if (scene == 0) {
            preWaterLevel += wlr;

            for (let i = 0; i < preGrid.length; i++) {
                for (let j = 0; j < preGrid[i].length; j++) {
                    drawGrid(preGrid, i, j,preWaterLevel);
                }
            }

            fill(255);
            stroke(0);
            rect(width / 2, height / 2 - 50, width - 100, 100); // play
            rect(width / 2, height / 2 + 75, width - 100, 100); // how to
            rect(width / 2, height / 2 + 200, width - 100, 100); // highscores

            if (mouseX >= width / 2 - (width - 100) / 2 && mouseX <= width / 2 + (width - 100) / 2) {
                if (mouseY >= height / 2 - 100 && mouseY <= height / 2) {
                    fill(230);
                    if (mouseIsPressed) {
                        fill(200);
                    }
                    rect(width / 2, height / 2 - 50, width - 100, 100); // play
                } else if (mouseY >= height / 2 + 25 && mouseY <= height / 2 + 125) {
                    fill(230);
                    if (mouseIsPressed) {
                        fill(200);
                    }
                    rect(width / 2, height / 2 + 75, width - 100, 100); // how to
                } else if (mouseY >= height / 2 + 150 && mouseY <= height / 2 + 250) {
                    fill(230);
                    if (mouseIsPressed) {
                        fill(200);
                    }
                    rect(width / 2, height / 2 + 200, width - 100, 100); // highscores
                }
            }

            // if (score != 0) {
            //     while(true) {
            //         console.log(1 / 0);
            //     }
            // }

            fill(0);
            textAlign(CENTER, CENTER);
            text("On Thin Ice", width / 2, (height / 2 - 100) / 2);

            textSize(15);
            text("By Alex Loan and Audrey Loan", width / 2, (height / 2 - 100) / 2 + 50);

            textSize(50);
            text("PLAY", width / 2, height / 2 - 50);
            text("HOW TO PLAY", width / 2, height / 2 + 75);
            text("HIGH SCORES", width / 2, height / 2 + 200);

            textAlign(LEFT, BASELINE);
        } else if (scene == 1) {
            // how to
            fill(255);
            if (mouseX >= width * 3 / 4 && mouseX <= width * 3 / 4 + 200 && mouseY >= height * 7 / 8 - 25 && mouseY <= height * 7 / 8 + 25) {
                fill(230);
                if (mouseIsPressed) {
                    fill(200);
                }
            }
            rect(width * 3 / 4 + 100, height * 7 / 8, 200, 50);
            fill(0);
            text("How To Play",width/6,height/8);
            textSize(20);
            text("Once you've clicked the play button, an animation will appear. Click anywhere to skip it.\nAfter the game has started, you can use the arrow keys and/or WASD to move around.\nIf you go to one side of the screen (left or right, not top or bottom), the view will change.\nYou'll see trash (usually white objects) and water.\nTouching trash makes you lose health, and you lose health while you're in water, killing you after a few seconds.\nYou also don't gain score when you're in water.\nThere are also fish, which are blueish-green. If you collect them, it'll heal half your health.\nThere are also seals, which heal you to full health and give you 100 score.\nLastly, there is a mother bear, which looks like your character except with a pink bow on it.\nIf you touch it, it will give you 1000 points and reset the water level, but once you do, the water level rises faster.\nTouching the mother bear also increases the year by 1, and once you reach year "+(startingYear+totalYears+1)+", you'll complete the game.\nAfter you die, or complete the game, another animation will play. You can click to skip it.\nIf your score is high enough to get on the high scores page, you'll get a series of messages about what name you\nchoose and what message you want to put up there.",width/10,height/6);
            textSize(50);
            text("Back", width * 3 / 4 + 50, height * 7 / 8 + 18);
        } else if (scene == 2) {
            // high scores
            fill(0);
            let t = "Your high score: " + player.hs;
            if (player.hs < 0) {
                t = "Play a game to see your high score.";
            }

            let sc = makeScores(scores);
            let te = makeText(sc);

            // textAlign(CENTER, CENTER);
            textFont("Consolas")
            textSize(30);
            textAlign(LEFT,BASELINE);
            text("HIGH SCORES",width/4,height / 3 - 50);
            text("GAME STATS",width/4,height / 4 - 100);
            textSize(15);
            text("Games Played: "+gamesPlayed,width/4,height / 4 - 75);
            text("Unique Users: "+uniqueUsers,width/4,height / 4 - 50);
            text(t, width / 2, height - 50);
            text(te, width / 4, height / 3);


            // textAlign(LEFT, BASELINE);
            textFont("Arial")
            textSize(50);

            fill(255);
            if (mouseX >= width * 3 / 4 && mouseX <= width * 3 / 4 + 200 && mouseY >= height * 7 / 8 - 25 && mouseY <= height * 7 / 8 + 25) {
                fill(230);
                if (mouseIsPressed) {
                    fill(200);
                }
            }
            rect(width * 3 / 4 + 100, height * 7 / 8, 200, 50);

            fill(0);
            text("Back", width * 3 / 4 + 50, height * 7 / 8 + 18);

            // console.log(scores);
        }
        
        return;
    }

    if (animation) {
        for (let i = 0; i < SPRITES.length; i++) {
            SPRITES[i].hide();
        }

        for (let i = 0; i < fishes.length; i++) {
            fishes[i].hide();
        }

        background(0);
        // drawAnimation(animationNum);

        if (skipped || ended) {
            animation = false;
            skipped = false;
            ended = false;
            animations[animationNum].pause();
            animations[animationNum].hidden = true;

            if (animationNum == 0) {
                socket.emit("ADD_GAME",null);
                player.reset();
                waterLevel = 0;
                txGens = [];
                fishCoords = [];
                trashCoords = [];
                sealCoords = [];
                mother = null;
                wlr = 0.000125;
                year = 0; // my iq
                ofs = random(5, 10) * 1000;
                grid = generateGrid(floor(width / SIZE), floor(height / SIZE), ofs);
                grid[floor(player.x / width * SIZE)][floor(player.y / height * SIZE)] = max(grid[floor(player.x / width * SIZE)][floor(player.y / height * SIZE)], 0.17);
            }

            if (animationNum >= animations.length - 1) {
                menu = true;
                preGrid = generateGrid(floor(width / SIZE), floor(height / SIZE), random(500, 1000));
                preWaterLevel = 0;
                scene = 0;

                if (player.nhs) {
                    alert("Your score of " + player.score + " was high enough to be on the leaderboard! This means you can submit your name and a message to display to anyone, along with your score, on the high scores page.");
                    let name = prompt("What's your name?");
                    let message = prompt("What message would you like to display?");
                    // console.log("emitting");
                    if (!name) name = "Anonymous";
                    socket.emit("score", {score: player.score, message, name, year});
                    // console.log("emitted");
                    waiting = true;
                }
            }
        }

        // if (score != 0) {
        //     while(true) {
        //         console.log(1 / 0);
        //     }
        // }

        return;
    }

    background(255);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            drawGrid(grid, i, j, waterLevel);
        }
    }

    player.update();

    fill(255);
    stroke(0);
    rect(width / 2, SIZE, 200, SIZE);
    fill(255 * (1 - player.health), 255 * player.health, 0);
    rect(width / 2, SIZE, player.health * 200, SIZE);

    fill(0);
    text(player.score, 5, 55);

    waterLevel += wlr;

    // if (score != 0) {
    //     while(true) {
    //         console.log(1 / 0);
    //     }
    // }

    if (waterLevel > 1) {
        initializeAnimation(1);
    }

    if (setWaterLevel){
        if (waterLevel < 0.01){
            waterLevel = 0;
            setWaterLevel = false;
        }
        waterLevel *= 0.85;
    }
    if (setScore > 0){
        player.score += ceil(setScore/50);
        setScore -= ceil(setScore/50);
    }

    updateFish();
    updateTrash();
    updateSeals();
    updateMother();
    drawYear(0.1,0.925);
}

function mouseClicked() {
    if (menu) {
        if (scene == 0) {
            if (mouseX >= width / 2 - (width - 100) / 2 && mouseX <= width / 2 + (width - 100) / 2) {
                if (mouseY >= height / 2 - 100 && mouseY <= height / 2) {
                    // clicked 'play'
                    initializeAnimation(0);
                    ofs = random(5, 10) * 1000;
                    menu = false;
                } else if (mouseY >= height / 2 + 25 && mouseY <= height / 2 + 125) {
                    // clicked 'how to play'
                    scene = 1;
                } else if (mouseY >= height / 2 + 150 && mouseY <= height / 2 + 250) {
                    // clicked 'high scores'
                    scene = 2;
                    socket.emit("reqScores", null);
                    socket.emit("reqData",null);
                }
            }
        } else if (scene == 1) {
            // how to play
            if (mouseX >= width * 3 / 4 && mouseX <= width * 3 / 4 + 200 && mouseY >= height * 7 / 8 - 25 && mouseY <= height * 7 / 8 + 25) {
                scene = 0;
            }
        } else if (scene == 2) {
            if (mouseX >= width * 3 / 4 && mouseX <= width * 3 / 4 + 200 && mouseY >= height * 7 / 8 - 25 && mouseY <= height * 7 / 8 + 25) {
                scene = 0;
            }
        }
    } else if (animation) {
        // skip animation
        skipped = true;
    }
}

function generateGrid(w, h, offset) {
    if (!offset) offset = 0;

    let grid = new Array(w);
    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(h);

        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = noise(i * ROUGH / grid.length + offset + tx * ROUGH, j * ROUGH / grid[i].length + offset) - 0.5 * j / grid[i].length;
        }
    }

    let taken = false;
    for (let i = 0; i < txGens.length; i++) {
        if (txGens[i] == tx) {
            taken = true;
            break;
        }
    }

    if (!taken) {
        generateFish(grid);
        generateTrash(grid);
        generateSeals(grid);
        generateMother(grid);
        txGens.push(tx);
    }

    return grid;
}

function drawGrid(grid, i, j, water) {
    if (grid[i][j] > water) {
        fill(255);
        noStroke();
        rect(i * SIZE + 1, j * SIZE + 1, SIZE, SIZE);
    } else {
        noStroke();
        fill(200 - (150 * (water - grid[i][j])), 255 - (200 * (water - grid[i][j])), 240 - (10 * (water - grid[i][j])));
        let y = 0;
        let x = 0;
        if (i+1 < grid.length){
            if (grid[i+1][j] <= water) y = 1;
        }
        if (j+1 < grid.length){
            if (grid[i][j+1] <= water) x = 1;
        }
        rect(i * SIZE, j * SIZE, SIZE+y, SIZE+x);

        let a = adjacentWater(grid, i, j, water);
        stroke(0);
        if (a[0]) {
            line(i * SIZE - SIZE / 2, j * SIZE - SIZE / 2, (i + 1) * SIZE - SIZE / 2, j * SIZE - SIZE / 2);
        }
        if (a[1]) {
            line(i * SIZE - SIZE / 2, j * SIZE - SIZE / 2, i * SIZE - SIZE / 2, (j + 1) * SIZE - SIZE / 2);
        }
    }
}

function adjacentWater(g, i, j, water) {
    let top = true;
    let left = true;

    if (j > 0) {
        top = (g[i][j - 1] > water);
    }
    if (i > 0) {
        left = (g[i - 1][j] > water);
    }

    return [top, left];
}

function makeScores(s) {
    let a = [];
    for (let i = 0; i < ((Object.keys(s).length > 10) ? 10 : Object.keys(s).length); i++) {
        a[i] = s["" + (i + 1)];
    }
    return a;
}

function makeText(a) {
    let t = "";
    for (let i = 0; i < a.length; i++) {
        if (!a[i].name) a[i].name = "Anonymous";
        a[i].name = a[i].name.substring(0, 30);
        let y;
        if (!a[i].year) {y = 0;}
        else {y = a[i].year}
        y = nf(y+startingYear, (a[0].year+startingYear).toString().length);
        let s = " ";
        for (let j = 0; j < a[0].score.toString().length + 29 - a[i].name.length; j++) {s += "-";}
        if (s != " ") s += " ";

        t += nf(i + 1, 2) + ". " + nf(a[i].score, a[0].score.toString().length) + " (Year "+(y)+") by " + a[i].name + ((a[i].message) ? (s + a[i].message) : "") + "\n";
    }
    return t;
}

function initializeAnimation(num) {
    animation = true;
    animationNum = num;

    animations[num].hidden = false;
    animations[num].currentTime = 0;
    animations[num].play();
}

// function drawAnimation(num) {
//     background(0);
//     fill(255);
//     //text(num, width / 2, height / 2);
//     if (num == 0) {
//         //
//     } else if (num == 1) {
//         text(player.score, width / 2, height / 4);
//     }
// }

function drawFish(f, x, y, scl) {
    if (!scl) scl = 1;
    f.show();
    f.position(x, y);
    f.style("width", scl * fish.width + "px");
    f.style("height", scl * fish.height + "px");
    // image(fish, x, y, scl * fish.width, scl * fish.height);
}

function drawImage(i, x, y, scl) {
    if (!scl) scl = 1;
    image(i, x, y, scl * i.width, scl * i.height);
}

function updateMother(){
    if (mother !== null){
        if (mother.tx === tx){
            drawImage(motherImg, mother.i*SIZE,mother.j*SIZE - motherImg.height / 2,2);
            if (mother.i*SIZE === player.x && mother.j*SIZE === player.y){
                setWaterLevel = true;
                wlr *= 1.125;
                year++;
                setScore += 1000;
                mother = null;

                if (year > totalYears) {
                    player.health = -1;
                }
            }
        }
    }
}
function generateFish(grid) {
    for (let i = 2; i < grid.length - 2; i++) {
        for (let j = 2; j < grid[i].length - 2; j++) {
            if ((i + 0.5) * SIZE == player.x && (j + 0.5) * SIZE == player.y) {
                continue;
            }

            if (grid[i][j] <= waterLevel) {
                let up = (grid[i - 1][j] > waterLevel);
                let down = (grid[i + 1][j] > waterLevel);
                let left = (grid[i][j - 1] > waterLevel);
                let right = (grid[i][j + 1] > waterLevel);
                if ((up || down || left || right) && random(1) > 0.99) {
                    fishCoords.push({tx, i, j});

                    let f = createImg("assets/fish.gif");
                    f.hide();
                    f.style("z-index", "9");

                    fishes.push(f);
                }
            }
        }
    }
}
function generateSeals(grid){
    for (let i = 2; i < grid.length - 2; i++) {
        for (let j = 2; j < grid[i].length - 2; j++) {
            if ((i + 0.5) * SIZE == player.x && (j + 0.5) * SIZE == player.y) {
                continue;
            }

            if (grid[i][j] <= waterLevel) {
                let up = (grid[i - 1][j] > waterLevel);
                let down = (grid[i + 1][j] > waterLevel);
                let left = (grid[i][j - 1] > waterLevel);
                let right = (grid[i][j + 1] > waterLevel);
                if ((up || down || left || right) && random(1) > 0.999) {
                    sealCoords.push({tx,i, j});
                }
            }
        }
    }
}
function generateMother(grid){
    for (let i = 2; i < grid.length - 2; i++) {
        for (let j = 2; j < grid[i].length - 2; j++) {
            if ((i + 0.5) * SIZE == player.x && (j + 0.5) * SIZE == player.y) {
                continue;
            }

            if (grid[i][j] > waterLevel) {
                let up = (grid[i - 1][j] > waterLevel);
                let down = (grid[i + 1][j] > waterLevel);
                let left = (grid[i][j - 1] > waterLevel);
                let right = (grid[i][j + 1] > waterLevel);
                if ((up && down && left && right) && random(1) > 0.9999) {
                    if (mother === null){
                        mother = {tx,i, j};
                    }
                    if(mother != null){
                        if (mother.tx !== tx){
                            // if (random(1) > 0.9) mother = null;
                        }
                    }
                }
            }
        }
    }
}
function generateTrash(grid) {
    for (let i = 2; i < grid.length - 2; i++) {
        for (let j = 2; j < grid[i].length - 2; j++) {
            let spot = false;
            for (let k = 0; k < fishCoords.length; k++) {
                if (fishCoords[k].tx == tx && fishCoords[k].i == i && fishCoords[k].j == j) {
                    spot = true;
                    break;
                }
            }
            if (spot) {
                continue;
            }

            if ((i + 0.5) * SIZE == player.x && (j + 0.5) * SIZE == player.y) {
                continue;
            }
            if (grid[i][j] <= waterLevel || random(1) > 0.8) {
                if (random(1) > 0.99) {
                    trashCoords.push({tx, i, j, type: floor(random(TRASH.length))});
                }
            }
        }
    }
}

function updateFish() {
    for (let i = fishCoords.length - 1; i >= 0; i--) {
        // if (fishCoords[i].i > grid.length - 2 || fishCoords[i].i < 2 || fishCoords[i].j > grid[fishCoords[i].i].length - 2 || fishCoords[i].j < 2) {
        //     fishCoords.splice(i, 1);
        //     fishes[i].hide();
        //     fishes.splice(i, 1);
        // }

        if (fishCoords[i].tx == tx) {
            drawFish(fishes[i], fishCoords[i].i * SIZE + SIZE / 4, fishCoords[i].j * SIZE, 1.5);

            if ((fishCoords[i].i + 1) * SIZE == player.x && (fishCoords[i].j + 1) * SIZE == player.y) {
                fishCoords.splice(i, 1);
                fishes[i].hide();
                fishes.splice(i, 1);
                player.health += 0.5 + waterLevel / 10;
                player.score += 10;
            }
        } else {
            fishes[i].hide();
        }
    }
}
function updateSeals(){
    for (let i = sealCoords.length - 1; i >= 0; i--){
        if (sealCoords[i].tx === tx){
            drawImage(sealie, sealCoords[i].i*SIZE,sealCoords[i].j*SIZE,1.5);
            if ((sealCoords[i].i) * SIZE == player.x && (sealCoords[i].j) * SIZE == player.y) {
                sealCoords.splice(i, 1);
                player.health = 1;
                player.score += 100;
            }
        }
    }
};

function updateTrash() {
    for (let i = trashCoords.length - 1; i >= 0; i--) {
        if (trashCoords[i].tx === tx) {
            drawImage(TRASH[trashCoords[i].type], trashCoords[i].i * SIZE + SIZE, trashCoords[i].j * SIZE + SIZE, 1.5);
            
            if ((trashCoords[i].i + 1) * SIZE == player.x && (trashCoords[i].j + 1) * SIZE == player.y) {
                trashCoords.splice(i, 1);
                player.health -= 0.5;
            }
        }
    }
}

function drawYear(xmult, ymult){
    stroke(0);
    strokeWeight(5);
    line(windowWidth*xmult,windowHeight*ymult,windowWidth*(1-xmult),windowHeight*ymult);
    let unit = (windowWidth*(1-xmult*2))/totalYears;
    strokeWeight(15);
    point(windowWidth*xmult+unit*year,windowHeight*ymult);
    strokeWeight(1);
    textSize(30);
    fill(0);
    textAlign(CENTER,CENTER);
    text(startingYear+year,windowWidth*xmult+unit*year,windowHeight*ymult-27.5);
    textSize(50);
    textAlign(LEFT)
};
