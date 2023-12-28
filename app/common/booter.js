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

function update(time, dt) {
    window.addEventListener('keydown', pauseGame);

    isPaused = menu.getState() || end.getState();

    if(physics.getEnd()) {
        end.show(time);
    }

    if(!isPaused) {
        if(scene.newScene) {
            loadNewScene();
            scene.newScene = false;
        }

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
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

async function loadNewScene() {
    let loader2 = new GLTFLoader();
    await loader2.load('../models/scene2.gltf');

    let newScene = loader2.loadScene(loader.defaultScene);

    for (let i = 0; i < newScene.children.length; i++) {
        newScene.children[i].components[0].translation[2] += aabb - (currentFloor.aabb.max[2] - currentFloor.aabb.min[2]);
        scene.children.push(newScene.children[i]);
    }
    
    loadNodes(loader2, '../models/scene2.gltf');
    setPhysics();

    currentFloor = loader2.getNode('Floor.001'); 
    aabb -= (currentFloor.aabb.max[2] - currentFloor.aabb.min[2]);
}

function loadNodes(loader, name) {
    SceneEnums.forEach(element => {
        if(element.name === name) {
            if(element.coin != null) {
                element.coin.forEach(coin => {
                    loader.loadNode(coin).isColectable = true;
                });
            }
            
            if(element.generate != null) {
                loader.loadNode(element.generate).isGenerate = true;
            }
            
            if(element.boxes != null) {
                element.boxes.forEach(box => {
                    loader.loadNode(box).isObstacle = true;
                });
            }
            
            if(element.walls != null) {
                element.walls.forEach(wall => {
                    loader.loadNode(wall).isStatic = true;
                });
            }
            
            if(element.floors != null) {
                element.floors.forEach(floor => {
                    loader.loadNode(floor).isStatic = true;
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

const canvas = document.querySelector('canvas');

const renderer = new UnlitRenderer(canvas);

await renderer.initialize();

const loader = new GLTFLoader();

await loader.load('../models/scene.gltf');

let scene = loader.loadScene(loader.defaultScene);
scene.newScene = false;

const character = loader.loadNode('Character');
const camera = loader.loadNode('Camera');
debugger;

loadNodes(loader, '../models/scene.gltf')

let menu = new Menu();
let end = new End();

let currentFloor = loader.getNode('Floor.002');
let aabb = 0;
let isPaused = false;
let numberOfCoins = 0;

character.addComponent(new ThirdPersonController(camera, character, canvas));
character.isDynamic = true;
character.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.2, 0.2, 0.2],
};

const physics = new Physics(scene);
setPhysics();

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
