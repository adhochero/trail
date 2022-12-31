// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getDatabase, set, get, update, remove, ref, child} 
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy2TugNO0--uZdkBnbjIQOsWzExxjQhNM",
  authDomain: "test-project-e1311.firebaseapp.com",
  databaseURL: "https://test-project-e1311-default-rtdb.firebaseio.com",
  projectId: "test-project-e1311",
  storageBucket: "test-project-e1311.appspot.com",
  messagingSenderId: "777474226716",
  appId: "1:777474226716:web:dde24e20e6422600a2bdd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

function insertData(id, x, y){
    set(ref(db, "entities/" + id), {
        X: x,
        Y: y
    })
    .then(() => {
        console.log('Data added successfully!!');
    })
    .catch((error) => {
        console.log(error);
    });
}

function updateData(id, x, y){
    update(ref(db, "entities/" + id), {
        X: x,
        Y: y
    })
    .then(() => {
        console.log("Data updated successfully!!");
    })
    .catch((error) => {
        console.log(error);
    });
}

function removeData(id){
    remove(ref(db, "entities/" + id))
    .then(() => {
        console.log("data removed successfully!!");
    })
    .catch((error) => {
        console.log(error);
    });
}

function findData(id){
    const dbref = ref(db);

    get(child(dbref, "entities/" + id))
    .then((snapshot) => {
        if(snapshot.exists()){
            console.log(snapshot.val().X, snapshot.val().Y);
        }
        else{
            console.log('no data found')
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

async function findAllEntities(){
    const dbref = ref(db);
    try {
        const snapshot = await get(child(dbref, "entities/"));
        if(snapshot.exists()){
            return snapshot.val();
        }
        else{
            throw new Error('no data found')
        }
    } catch(error){
        console.log(error);
    }
}

export { insertData, updateData, removeData, findData, findAllEntities }