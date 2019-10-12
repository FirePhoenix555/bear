class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.sx = x;
        this.sy = y;

        this.health = 1;

        this.score = 0;

        this.hs = -1;
        this.nhs = false;

        this.si = 0; // sprite index

        this.mx = 0;
        this.my = 0;
    }

    move() {
        this.si = 0;

        let left = keyIsDown(65) || keyIsDown(LEFT_ARROW);
        let up = keyIsDown(87) || keyIsDown(UP_ARROW);
        let right = keyIsDown(68) || keyIsDown(RIGHT_ARROW);
        let down = keyIsDown(83) || keyIsDown(DOWN_ARROW);

        if (up) {
            this.si = 1;
            this.my -= SPEED;
        }
        if (down) {
            this.si = 3;
            this.my += SPEED;
        }
        if (left) {
            this.si = 2;
            this.mx -= SPEED;
        }
        if (right) {
            this.si = 4;
            this.mx += SPEED;
        }

        // if both left and right are held or both up and down, just show the standing animation
        // but don't show it if there's another key pressed
        // but if all 4 are pressed, show it
        if (left && right) {
            if ((!up && !down) || (up && down)) {
                this.si = 0;
            }
        } else if (up && down) {
            if ((!left && !right) || (left && right)) {
                this.si = 0;
            }
        }
    }

    draw() {
        for (let i = 0; i < SPRITES.length; i++) {
            SPRITES[i].hide();
        }

        // fill(200);
        // stroke(0);
        // rect(this.x, this.y, SIZE, SIZE);

        let w = 35;
        let h = 35;

        SPRITES[this.si].show();
        SPRITES[this.si].position(this.x - (SIZE * (w / 25) / 2), this.y - (SIZE * ((h / 25) + 1) / 2 - 5));
        SPRITES[this.si].style("z-index", "10");
        SPRITES[this.si].style("width", w + "px");
        SPRITES[this.si].style("height", h + "px");
    }

    constrainMovement() {
        this.x += round(this.mx) * SIZE;
        this.y += round(this.my) * SIZE;

        this.x = (round((this.x - SIZE) / SIZE)) * SIZE + SIZE;
        this.y = (round((this.y - SIZE) / SIZE)) * SIZE + SIZE;

        if (this.mx < 0) {
            this.mx += round(-this.mx);
        } else if (round(this.mx) <= this.mx) {
            this.mx -= round(this.mx);
        } else {
            this.mx -= round(this.mx);
        }

        if (this.my < 0) {
            this.my += round(-this.my);
        } else if (round(this.my) <= this.my) {
            this.my -= round(this.my);
        } else {
            this.my -= round(this.my);
        }

        if (this.x < SIZE / 2 + 2) {
            this.x = width - SIZE - 2;
            tx--;
            grid = generateGrid(floor(width / SIZE), floor(height / SIZE), ofs);
        }
        if (this.x > width - SIZE / 2 - 2) {
            this.x = SIZE + 2;
            tx++;
            grid = generateGrid(floor(width / SIZE), floor(height / SIZE), ofs);
        }

        if (this.y < SIZE + 2) {
            this.y = SIZE + 2;
        }
        if (this.y > height - SIZE - 2) {
            this.y = height - SIZE - 2;
        }
    }

    update() {
        this.draw();

        this.move();

        this.constrainMovement();

        let l = this.getLocation();
        if (grid[l[0]][l[1]] <= waterLevel) {
            let deepness = waterLevel - grid[l[0]][l[1]];
            this.health -= deepness / 7.5 + 0.005;
        } else {
            this.health += 0.0015 - waterLevel / 100;
            this.score++;
        }
        
        // fill(0);
        // rect(l[0] * SIZE, l[1] * SIZE, SIZE, SIZE);

        if (this.health > 1) {
            this.health = 1;
        } else if (this.health <= 0) {
            if (this.score > this.hs) {
                this.hs = this.score;
            }
            socket.emit("reqScores1", null);
            initializeAnimation(1);
        }
    }

    getLocation() {
        let i = round(this.x / width * grid.length);
        return [i, round(this.y / height * grid[i].length)];
    }

    reset() {
        this.x = this.sx;
        this.y = this.sy;

        this.health = 1;

        this.score = 0;

        this.nhs = false;

        this.si = 0; // sprite index

        this.mx = 0;
        this.my = 0;
    }
}