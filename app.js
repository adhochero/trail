import { GetInput } from './getInput.js'
import { Entity } from './entity.js';
import { insertEntityData, updateEntityData, removeEntity, findEntity, findAllEntities } from './database.js'

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

let mouse = {x: 0, y: 0};
let follow = {x: 0, y: 0};
let followSpeed = 4;

let relativeMouse
let playerCenter
let betweenPlayerAndMouse

window.onload = init;

//remove me from database
window.addEventListener('beforeunload',(e) => {
    removeEntity(myName);
});

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
    if(myName === null) myName = 'default';

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
     playerCenter = {
        x: -entities[myIndex].position.x + canvas.width / 2,
        y: -entities[myIndex].position.y + canvas.height / 2
    }

     relativeMouse = {
        x: mouse.x - entities[myIndex].position.x,
        y: mouse.y - entities[myIndex].position.y 
    }

     betweenPlayerAndMouse = {
        x: playerCenter.x * 2 - relativeMouse.x,
        y: playerCenter.y * 2 - relativeMouse.y
    }

    follow.x = lerp(follow.x, betweenPlayerAndMouse.x, followSpeed * secondsPassed);
    follow.y = lerp(follow.y, betweenPlayerAndMouse.y, followSpeed * secondsPassed);

    entities.forEach(entity => {
        entity.update(secondsPassed);
    });
}

function draw(){
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // to rest
    context.beginPath();

    //draw background
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#a5cbb3";
    context.fill();

    if(entities.length <= 0) return
    //draw things that move with translate
    context.save();

    context.translate(follow.x, follow.y);

    entities.forEach(entity => {
        entity.draw(context);
    });
    
    context.restore();

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