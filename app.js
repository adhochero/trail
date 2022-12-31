import { GetInput } from './getInput.js'
import { Entity } from './entity.js';
import { insertData, updateData, removeData, findData, findAllEntities } from './database.js'

let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;

let myName = 'default';
let input;
let keys = [];
let entities = [];

window.onload = init;
window.addEventListener('beforeunload',function(){
    const index = entities.findIndex((entity) => entity.id === myName);
    removeData(entities[index].id);
});

function init(){
    // Get a reference to the canvas
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 666;
    canvas.height = 500;

    //prompt for name
    //myName = prompt('enter name')

    //create new GetInput class
    input = new GetInput(keys);
    
    //add me to database
    insertData(myName, 333, 250);

    //create entities for ones in database
    async function proccessEntities(){
        const dbEntities = await findAllEntities();
        const dbEntitiesKeys = Object.keys(dbEntities);
        const dbEntitiesValues =  Object.values(dbEntities)

        for (let i = 0; i < dbEntitiesKeys.length; i++ ){
            entities.push(new Entity(keys));
            entities[i].id = dbEntitiesKeys[i];

            if(dbEntitiesKeys[i] === myName) 
                entities[i].isMine = true;
        }
    }
    proccessEntities();

    // findData(entities[0].id);
    // removeData(entities[0].id);

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
