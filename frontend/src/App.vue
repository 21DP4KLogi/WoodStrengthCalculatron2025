<template>
  <div id="authmenu" v-if="!authenticated">
    <h1>WoodStrengthCalculatron2025</h1>
    <span>Lietotājvārds </span>
    <input v-model="username" /> <br>
    <span>Parole </span>
    <input v-model="password" type="password" /> <br>
    <button @click="auth()">Pieslēgties</button>
  </div>
  <div id="menu" v-if="authenticated">
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
    <button @click="calculate()">Aprēķināt</button>
  </div>
  <div id="calchistory" v-if="authenticated">
    <table>
      <tbody>
        <tr>
          <th>Garums</th>
          <th>Platums</th>
          <th>Augstums</th>
          <th>Stiprība</th>
          <th>Rezultāts</th>
        </tr>
        <template v-for="calc in history">
          <tr>
            <td>{{ calc.length }}</td>
            <td>{{ calc.width }}</td>
            <td>{{ calc.height }}</td>
            <td>{{ calc.strength }}</td>
            <td>{{ calc.result }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style src="./index.css"></style>

<script setup>
import { ref, computed, watch } from 'vue';
import * as THREE from 'three';
import textureImage from './texture_09.png';

const URL = "http://localhost:3000"

const authenticated = ref(false);
const garums = ref(6);
const platums = ref(0.1);
const augstums = ref(0.3);
const stipriba = ref(20000);
const pielaujamaSlodze = ref(0);
const history = ref([]);

const username = ref("")
const password = ref("")
/*
const pretestibasMoments = computed(() => { 
  return (platums.value * augstums.value ** 2) / 6;
});
const pielaujamaSlodze = computed(() => {
  return 8 * pretestibasMoments.value * ((stipriba.value) / (garums.value ** 2))
});
*/

async function checkauth() {
  const response = await fetch(URL + "/checkauth", {
    credentials: "include"
  })
  authenticated.value = response.status === 200
  history.value = JSON.parse(await response.text())
}

checkauth()

async function auth() {
  const response = await fetch(
    URL + "/login",
    {
      method: "POST",
      //mode: "no-cors",
      credentials: "include",
      body: new URLSearchParams({
        "pass": password.value,
        "name": username.value
      })
    }
  )
  checkauth()
}

async function calculate() {
  const response = await fetch(
    URL + "/calculate",
    {
      method: "POST",
      credentials: "include",
      body: new URLSearchParams({
        "strength": stipriba.value,
        "length": garums.value,
        "width": platums.value,
        "height": augstums.value
      })
    }
  )
  const result = await response.text();
  pielaujamaSlodze.value = result;
  history.value.push({
    "strength": stipriba.value,
    "length": garums.value,
    "width": platums.value,
    "height": augstums.value,
    "result": result
  })
}

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
