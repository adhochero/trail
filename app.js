import { GetInput } from './getInput.js'
import { Entity } from './entity.js';
import { Environment } from './environment.js'
import { insertEntityData, updateEntityData, removeEntity, findEntity, findAllEntities } from './database.js'

import {Gun} from './gun.js'

let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;
let fps = 0;

let myName = 'default';
let input;
let keys = [];
let entities = [];
let myIndex = -1;
let environment;

let mouse = {x: 0, y: 0};
let follow = {x: 0, y: 0};
let followSpeed = 8;

let gun;

window.onload = init;

function init(){
    // Get a reference to the canvas
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 666;
    canvas.height = 500;

    canvas.addEventListener('mousemove', (e) => {
        // Get the bounding rect of the canvas element
        const rect = canvas.getBoundingClientRect();

        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    })

    //prompt for name
    myName = prompt('enter name');
    //if no name is given generate random four digit number
    if(myName === null || myName === '') myName = Math.floor(1000 + Math.random() * 9000).toString();

    //create new Environment
    environment = new Environment();

    //create new Gun
    gun = new Gun();

    //create new GetInput class
    input = new GetInput(keys);
    
    //add me to database
    insertEntityData(myName, 333, 250, {x: 0, y:0});

    // Start the first frame request
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    // Move forward in time with a maximum amount
    secondsPassed = Math.min(secondsPassed, 0.1);

    // Calculate fps
    fps = Math.round(1 / secondsPassed);

    //functions to run each frame
    update();
    draw();

    // Keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

function update() {
    //update from and to database
    updateEntities();

    //sort entities for proper z order
    entities.sort((a, b) => a.position.y - b.position.y);
    //find my index
    myIndex = entities.findIndex((entity) => entity.id === myName);

    if(entities.length <= 0) return

    //calculate center of my entity and mouse and use for "cameras" follow value
    const playerCenter = {
        x: -entities[myIndex].position.x + canvas.width / 2,
        y: -entities[myIndex].position.y + canvas.height / 2
    }

    const relativeMouse = {
        x: mouse.x - entities[myIndex].position.x,
        y: mouse.y - entities[myIndex].position.y 
    }

    const betweenPlayerAndMouse = {
        x: playerCenter.x * 2 - relativeMouse.x,
        y: playerCenter.y * 2 - relativeMouse.y
    }

    follow.x = lerp(follow.x, betweenPlayerAndMouse.x, followSpeed * secondsPassed);
    follow.y = lerp(follow.y, betweenPlayerAndMouse.y, followSpeed * secondsPassed);

    //run entities update function
    entities.forEach(entity => {
        entity.update(secondsPassed);
    });

    collideWithWalls(entities[myIndex]);
}

function draw(){
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // to reset path, stopping memory leaks
    context.beginPath();

    //draw temp background color
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#a5cbb3";
    context.fill();

    //draw things in world space
    context.save();

    if(entities.length > 0){
        //move "camera"
        context.translate(follow.x, follow.y);

        //draw environment
        environment.draw(context);
    
        //run entities draw function
        entities.forEach(entity => {
            entity.draw(context);
        });
    }
    
    context.restore();

    //draw fps
    context.fillStyle = "#fff";
    context.font = "14px Special Elite";
    context.textAlign = "center";
    context.fillText("FPS: "+ fps, 40, 20);
}

//update local entities to match ones in database
async function updateEntities(){
    const dbEntities = await findAllEntities();
    const dbEntitiesKeys = Object.keys(dbEntities);
    const dbEntitiesValues =  Object.values(dbEntities)

    for (let i = 0; i < dbEntitiesKeys.length; i++ ){
        //create an entity for each one in db, if it doesnt already exist
        if(!entities.some((entity) => entity.id === dbEntitiesKeys[i])){
            const newEntity = new Entity(keys);
            newEntity.id = dbEntitiesKeys[i];
            if(newEntity.id === myName) newEntity.isMine = true;
            entities.push(newEntity);
        }
        //for existing entities update position with data from database
        else{
            const index = entities.findIndex((entity) => entity.id === dbEntitiesKeys[i]);
            if(entities[index].id !== myName){
                entities[index].position.x = dbEntitiesValues[i].x;
                entities[index].position.y = dbEntitiesValues[i].y;
                entities[index].moveDirection.x = dbEntitiesValues[i].mdx;
                entities[index].moveDirection.y = dbEntitiesValues[i].mdy; 
            }
        }
    }

    for (let i = 0; i < entities.length; i++ ){
        //remove any existing entities that are not in the db
        if(!dbEntitiesKeys.some((id) => id === entities[i].id)){
            entities.splice(i, 1);
        }
    }

    //find my index
    const index = entities.findIndex((entity) => entity.id === myName);
    //update my entity data
    updateEntityData(myName, entities[index].position.x, entities[index].position.y, entities[index].moveDirection);
}

function lerp(start, end, t){
    return  (1 - t) * start + end * t;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function checkCircleCollision(cir1, cir2){
    //assumes x and y pos is center
    let dx = cir1.position.x - cir2.position.x;
    let dy = cir1.position.y - cir2.position.y;
    let radiusSum = cir1.width * 0.5 + cir2.width * 0.5;

    return (dx * dx + dy * dy <= radiusSum * radiusSum)
}

function checkCircleToRectCollision(cir, rect){
    //assumes x and y pos is center
    let distance = {
        x: Math.abs(cir.position.x - rect.x),
        y: Math.abs(cir.position.y - rect.y)
    };

    if(distance.x > rect.width/2 + cir.width/2) return false;
    if(distance.y > rect.height/2 + cir.height/2) return false;

    if(distance.x <= rect.width/2) return true;
    if(distance.y <= rect.height/2) return true;

    let dx = distance.x - rect.width/2;
    let dy = distance.y - rect.height/2;
    return (dx * dx + dy * dy <= cir.width/2 * cir.width/2);
}

//remove me from database
window.addEventListener('beforeunload',(e) => {
    removeEntity(myName);
});


function collideWithWalls(entity){
    environment.walls.forEach(wall => {
        //check for entity/wall collisions
        if(checkCircleToRectCollision(entity, wall)){
            if (entity.position.x + entity.moveDirection.x > (wall.x - wall.width/2) - entity.width/2 &&
                entity.position.x < (wall.x - wall.width/2)){
                // entity.velocity.x = -entity.moveDirection.x * 1.25;
                entity.position.x = wall.x - wall.width/2 - entity.width/2;
            }
            else if (entity.position.x + entity.moveDirection.x < (wall.x + wall.width/2) + entity.width/2 &&
                entity.position.x > (wall.x + wall.width/2)){
                // entity.velocity.x = -entity.moveDirection.x * 1.25;
                entity.position.x = wall.x + wall.width/2 + entity.width/2;
            }
            else if (entity.position.y + entity.moveDirection.y > (wall.y - wall.height/2) - entity.height/2 &&
                entity.position.y < (wall.y - wall.height/2)){
                // entity.velocity.y = -entity.moveDirection.y * 1.25;
                entity.position.y = wall.y - wall.height/2 - entity.height/2;
            }
            else if (entity.position.y + entity.moveDirection.y < (wall.y + wall.height/2) + entity.height/2 &&
                entity.position.y > (wall.y + wall.height/2)){
                // entity.velocity.y = -entity.moveDirection.y * 1.25;
                entity.position.y = wall.y + wall.height/2 + entity.height/2;
            }
        }
    });
}