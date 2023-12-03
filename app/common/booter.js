import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';
import { ThirdPersonController } from '../engine/controllers/ThirdPersonController.js';

import { Camera, Model } from '../engine/core.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '../engine/core/MeshUtils.js';

import { Physics } from './Physics.js';

// Function to load a new scene
async function loadNewScene() {
    const loader2 = new GLTFLoader();
    await loader2.load('../models/scene2.gltf');

    // Assuming the new scene is loaded into the same variable (`scene`)
    var newScene = loader2.loadScene(loader.defaultScene);
    //debugger;
    
    // Copy the scene's children into the old scene
    for (let i = 0; i < newScene.children.length; i++) {
        //set the new scene's children to the last z position of the old scene
        newScene.children[i].components[0].translation[2] = scene.children[scene.children.length - 1].components[0].translation[2];
        //add the child to the scene
        scene.children.push(newScene.children[i]);
    }
    //debugger;
    loader2.loadNode('Floor.001').isStatic = true;

    const physics = new Physics(scene);
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

var scene = loader.loadScene(loader.defaultScene);

const character = loader.loadNode('Character');

const camera = loader.loadNode('Camera');

character.addComponent(new ThirdPersonController(camera, character, canvas));
character.isDynamic = true;
character.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.2, 0.2, 0.2],
};

//debugger;


loader.loadNode('Coin.000').isColectable = true;
loader.loadNode('Box.000').isStatic = true;
loader.loadNode('Box.001').isStatic = true;
loader.loadNode('Box.002').isStatic = true;
loader.loadNode('Box.003').isStatic = true;
loader.loadNode('Box.004').isStatic = true;
loader.loadNode('Box.005').isStatic = true;
loader.loadNode('Wall.000').isStatic = true;
loader.loadNode('Wall.001').isStatic = true;
loader.loadNode('Wall.002').isStatic = true;
loader.loadNode('Wall.003').isStatic = true;
loader.loadNode('Floor.002').isStatic = true;
//loader.loadNode('Floor.001').isStatic = true;

const physics = new Physics(scene);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);

    if(character.getComponentOfType(ThirdPersonController).keys['KeyR']) {
        loadNewScene();
    }
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    //debugger;
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
