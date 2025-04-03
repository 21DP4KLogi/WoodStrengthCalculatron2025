<template>
  <div id="menu">
    <h1>WoodStrengthCalculatron2025</h1>
    <span>Sijas garums </span>
    <input v-model="garums" /> <br>
    <span>Sijas platums </span>
    <input v-model="platums" /> <br>
    <span>Sijas augstums </span>
    <input v-model="augstums" /> <br>
    <span>Stiprība </span>
    <input v-model="stipriba" /> <br>
    <!-- <p>Pretestības moments: <span>{{ pretestibasMoments }}</span></p> -->
    <p>Pieļaujamā slodze: <span>{{ pielaujamaSlodze }}</span> KN/m</p>
  </div>
</template>

<style src="./index.css"></style>

<script setup>
import { ref, computed, watch } from 'vue';
import * as THREE from 'three';
import textureImage from './texture_09.png';

const garums = ref(6);
const platums = ref(0.1);
const augstums = ref(0.3);
const stipriba = ref(20000);
const pretestibasMoments = computed(() => { 
  return (platums.value * augstums.value ** 2) / 6;
});
const pielaujamaSlodze = computed(() => {
  return 8 * pretestibasMoments.value * ((stipriba.value) / (garums.value ** 2))
});

// Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x404040, 1);
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry(platums.value, augstums.value, garums.value)

const texture = new THREE.TextureLoader().load( textureImage, () => {
  renderer.render( scene, camera );
});
//texture.repeat.set( 8, 8 );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

const material = new THREE.MeshBasicMaterial( { map: texture } );

const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;
camera.position.y = 1;
camera.position.x = -2;

// Reactive visualisation
watch(
  [garums, platums, augstums],
  () => {
    let newGeometry = new THREE.BoxGeometry(platums.value, augstums.value, garums.value)
    cube.geometry = newGeometry;
    renderer.render( scene, camera );
  }
)

window.onresize = function(event) {    
  renderer.setSize( window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render( scene, camera );
};

renderer.render( scene, camera );
</script>
