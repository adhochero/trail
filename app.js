import { GetInput } from './getInput.js'
import { Entity } from './entity.js';
import { insertEntityData, updateEntityData, removeEntity, findEntity, findAllEntities } from './database.js'

let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;

let myName = 'default';
let input;
let keys = [];
let entities = [];

window.onload = init;

//remove me from database
window.addEventListener('unload',function(){
    removeEntity(myName);
});

function init(){
    // Get a reference to the canvas
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 666;
    canvas.height = 500;

    //prompt for name
    myName = prompt('enter name')

    //create new GetInput class
    input = new GetInput(keys);
    
    //add me to database
    insertEntityData(myName, 333, 250);

    // findData(entities[0].id);

    // Start the first frame request
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    // Move forward in time with a maximum amount
    secondsPassed = Math.min(secondsPassed, 0.1);

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

    entities.forEach(entity => {
        entity.update(secondsPassed);
    });
}

function draw(){
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    //draw below
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#a5cbb3";
    context.fill();

    entities.forEach(entity => {
        entity.draw(context);
    });
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
            if(entities[index].id !== myName)
                entities[index].position = dbEntitiesValues[i];
        }
    }

    for (let i = 0; i < entities.length; i++ ){
        //remove any existing entities that are not in the db
        if(!dbEntitiesKeys.some((id) => id === entities[i].id)){
            entities.splice(i, 1);
        }
    }

    //find index of my entity and update data
    const index = entities.findIndex((entity) => entity.id === myName);
    updateEntityData(myName, entities[index].position.x, entities[index].position.y);
}
