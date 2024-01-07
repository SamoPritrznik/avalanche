import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';
import { ThirdPersonController } from '../engine/controllers/ThirdPersonController.js';

import { Camera, Model } from '../engine/core.js';

import { SceneEnums } from './SceneEnums.js';
import { Menu } from './Menu.js';
import { End } from './End.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '../engine/core/MeshUtils.js';

import { Physics } from './Physics.js';

let changeTime = 0;

function update(time, dt) {
    window.addEventListener('keydown', pauseGame);

    isPaused = menu.getState() || end.getState();

    if(physics.getEnd()) {
        end.show(time);
    }
    if(!isPaused) {
        
        if(scene.newScene && (changeTime === 0 || time - changeTime > 2)) {
            changeTime = time;
            if(numberOfScenes % 2 == 0) {
                sceneQueue.push(scene3);
                loadNewScene(loader3, scene3, '../models/scene2.gltf');
                
            }
            else {
                sceneQueue.push(scene2);
                loadNewScene(loader2, scene2, '../models/scene1.gltf');
                //debugger;
            }
        }
        scene.newScene = false;

        scene.traverse(node => {
            for (const component of node.components) {
                component.update?.(time, dt);
            }
        });
    }

    physics.update(time, dt);
}

function pauseGame(event) {
    if(event.code === 'KeyP') {
        menu.show();
    }
}

function render() {
    renderer.render(scene, camera, lights);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

let translationVector = 0;
let oldTranslation = [0, 0];

async function loadNewScene(newLoader, newScene, name) {
    scene.newScene = false;
    numberOfScenes++;

    if(numberOfScenes % 2 == 0) {
        translationVector = -110.71667957305908*(numberOfScenes) - oldTranslation[1];
        oldTranslation[1] += translationVector;
    }else {
        translationVector = -110.71667957305908*(numberOfScenes) - oldTranslation[0];
        oldTranslation[0] += translationVector;
    }

    console.log(translationVector);
    
    if (numberOfScenes > 0) {
        
        // Translate the new scene by this vector
        newScene.children.forEach(child => {
            child.components[0].translation[2] += translationVector;
            scene.children.push(child);
        });
    }

    setPhysics();
}

function loadNodes(loader, name) {
    SceneEnums.forEach(element => {
        if(element.name === name) {
            if(element.lights != null) {
                element.lights.forEach(light => {
                    lights.push(loader.loadNode(light));
                });
            }

            if(element.floors != null) {
                element.floors.forEach(floor => {
                    //currentFloor.push(loader.loadNode(floor));
                });
            }

            if(element.coin != null) {
                element.coin.forEach(coin => {
                    loader.loadNode(coin).isColectable = true;
                });
            }
            
            if(element.generate != null) {
                loader.loadNode(element.generate).isGenerate = true;
            }
            
            if(element.boxes != null) {
                //debugger;
                element.boxes.forEach(box => {
                    if(loader.loadNode(box) === null) {
                        debugger;
                    }
                    loader.loadNode(box).isStatic = true;
                });
            }
            
            if(element.walls != null) {
                element.walls.forEach(wall => {
                    
                    if(wall.match(/Cube/)) {
                        //debugger;
                        loader.loadNode(wall).isSeethrough = true;
                    } else {
                        loader.loadNode(wall).isStatic = true;
                    }
                });
            }
            
            if(element.floors != null) {
                element.floors.forEach(floor => {
                    loader.loadNode(floor).isStatic = true;
                    //currentFloor.push(loader.loadNode(floor));
                });
            }   
        }
    });
}

function setPhysics() {
    scene.traverse(node => {
        const model = node.getComponentOfType(Model);
        if (!model) {
            return;
        }
    
        const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
        node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
    });
}

function calculateCharacterAABB(character) {
    const model = character.getComponentOfType(Model);
    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    character.aabb = mergeAxisAlignedBoundingBoxes(boxes);
}


const canvas = document.querySelector('canvas');

const renderer = new UnlitRenderer(canvas);

await renderer.initialize();

const loader = new GLTFLoader();
const loader2 = new GLTFLoader();
const loader3 = new GLTFLoader();

await loader.load('../models/startscene.gltf');
await loader2.load('../models/scene1.gltf');
await loader3.load('../models/scene2.gltf');

let scene = loader.loadScene(loader.defaultScene);
let scene2 = loader2.loadScene(loader2.defaultScene);
let scene3 = loader3.loadScene(loader3.defaultScene);
scene.newScene = false;

let sceneQueue = [];
let numberOfScenes = 0;

const character = loader.loadNode('Body.003');
const camera = loader.loadNode('Camera.003');
let lights = [];

let menu = new Menu();
let end = new End();

let currentFloor = [];
let aabb = 0;
let isPaused = false;
let numberOfCoins = 0;

loadNodes(loader, '../models/startscene.gltf');
loadNodes(loader2, '../models/scene1.gltf');
loadNodes(loader3, '../models/scene2.gltf');

let skybox = loader.loadNode('Sphere');
currentFloor.push(loader.getNode('Floor.015'));
currentFloor.push(loader.getNode('Floor.016'));

character.addComponent(new ThirdPersonController(camera, character, canvas, lights, skybox));
character.isDynamic = true;
calculateCharacterAABB(character);
//debugger;

const physics = new Physics(scene);
setPhysics();


new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
