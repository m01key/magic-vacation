import * as THREE from 'three';
import vertexStory from './vertexStory.glsl';
import fragmentStory from './fragmentStory.glsl';
import {animateEasingWithFPS} from '../../helpers/animate';
import {bezierEasing} from '../../helpers/cubic-bezier';

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const windowHalfWidth = window.innerWidth / 2;
const windowHalfHeight = window.innerHeight / 2;
const canvasStory = document.querySelector(`#canvasStory`);

const easeInOut = bezierEasing(0.41, 0, 0.54, 1);
const hueIntensityEasingFn = (timingFraction) => {
  return easeInOut(Math.sin(timingFraction * Math.PI));
};

const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);

const camera = new THREE.OrthographicCamera(-windowHalfWidth, windowHalfWidth, windowHalfHeight, -windowHalfHeight, 0, 1);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({canvas: canvasStory});

const textures = [
  {
    texture: loader.load(`/img/scene-1.png`),
    options: {hueShift: 0.0, distort: false}
  },
  {
    texture: loader.load(`/img/scene-2.png`),
    options: {
      hueShift: -0.5,
      distort: true
    },
    animations: {
      hue: {
        initial: -0.1,
        final: -0.5,
        duration: 3000,
        variation: 0.4,
      },
    }
  },
  {
    texture: loader.load(`/img/scene-3.png`),
    options: {hueShift: 0.0, distort: false}
  },
  {
    texture: loader.load(`/img/scene-4.png`),
    options: {hueShift: 0.0, distort: false}
  },
];

const bubbleDuration = 2100;
const glareOffset = 0.8;
const startRadianAngle = 1.96;
const endRadianAngle = 2.75;

const bubbles = [
  {
    radius: 80.0,
    initialPosition: [windowHalfWidth, -100],
    position: [windowHalfWidth - windowHalfWidth / 10, -100],
    finalPosition: [windowHalfWidth - windowHalfWidth / 10, windowHeight + 100],
    positionAmplitude: 60,
    glareOffset,
    glareAngleStart: startRadianAngle,
    glareAngleEnd: endRadianAngle,
    timeout: 0.05
  },
  {
    radius: 60.0,
    initialPosition: [windowHalfWidth - windowWidth / 6, -100],
    position: [windowHalfWidth - windowWidth / 6, -100],
    finalPosition: [windowHalfWidth - windowWidth / 6, windowHeight + 100],
    positionAmplitude: 40,
    glareOffset,
    glareAngleStart: startRadianAngle,
    glareAngleEnd: endRadianAngle,
    timeout: 0.70
  },
  {
    radius: 40.0,
    initialPosition: [windowHalfWidth + 150, -100],
    position: [windowHalfWidth + 150, -100],
    finalPosition: [windowHalfWidth + 150, windowHeight + 100],
    positionAmplitude: 30,
    glareOffset,
    glareAngleStart: startRadianAngle,
    glareAngleEnd: endRadianAngle,
    timeout: 0.90
  },
];

function addBubble(index) {
  if (textures[index].options.distort) {
    return {
      distortion: {
        value: {
          bubbles,
          resolution: [windowWidth, windowHeight],
        }
      },
    };
  }

  return {};
}

let geoWidth = 2048;
let geoHeight = 1024;
let configMaterial = {};
let bubblesValue = 0;
let time = {
  value: bubblesValue,
};

export const loadStory = () => {

  manager.onLoad = () => {

    textures.forEach(({texture, options}, index) => {

      configMaterial = {
        uniforms: {
          map: {
            value: texture,
          },
          options: {
            value: options,
          },
          time,
          ...addBubble(index),
        },
        vertexShader: vertexStory,
        fragmentShader: fragmentStory,
      };

      const material = new THREE.RawShaderMaterial(configMaterial);

      material.needsUpdate = true;

      const aspectCanvas = windowWidth / windowHeight;
      const aspectImage = geoWidth / geoHeight;

      const getHeightAndDependentWidth = () => {
        geoWidth = windowHeight * aspectImage;
        geoHeight = windowHeight;
      };

      const getWidthAndDependentHeight = () => {
        geoWidth = windowWidth;
        geoHeight = windowWidth / aspectImage;
      };

      if (aspectCanvas < 1 && aspectImage > 1) {
        getHeightAndDependentWidth();
      }
      if (aspectCanvas > 1 && aspectImage < 1) {
        getWidthAndDependentHeight();
      }
      if (aspectCanvas > 1 && aspectImage > 1 && aspectCanvas < aspectImage) {
        getHeightAndDependentWidth();
      }
      if (aspectCanvas > 1 && aspectImage > 1 && aspectCanvas > aspectImage) {
        getWidthAndDependentHeight();
      }
      if (aspectCanvas < 1 && aspectImage < 1 && aspectCanvas < aspectImage) {
        getHeightAndDependentWidth();
      }
      if (aspectCanvas < 1 && aspectImage < 1 && aspectCanvas > aspectImage) {
        getWidthAndDependentHeight();
      }

      const geometry = new THREE.PlaneGeometry(geoWidth, geoHeight);

      const slide = new THREE.Mesh(geometry, material);
      slide.position.set(geoWidth * index, 0, 0);

      scene.add(slide);
    });

    renderer.setSize(windowWidth, windowHeight);
    renderer.render(scene, camera);
  };
};

export const moveCameraX = (activeIndex) => {
  camera.position.x = geoWidth * activeIndex;
  renderer.render(scene, camera);

  if (textures[activeIndex].animations) {
    animateHueShift(activeIndex);
    animateBubbles();
  }
};

function animateBubbles() {
  if (configMaterial.uniforms.time.value < bubbleDuration / 1000) {
    configMaterial.uniforms.time.value += 0.01;
    requestAnimationFrame(animateBubbles);
  }
}

function animateHueShift(activeIndex) {
  const {initial, final, duration, variation} = textures[activeIndex].animations.hue;
  const offset = (Math.random() * variation * 2 + (1 - variation));
  animateEasingWithFPS(hueShiftIntensityAnimationTick(activeIndex, initial, final * offset), duration * offset, hueIntensityEasingFn)
  .then(() => animateHueShift(activeIndex));
}

function hueShiftIntensityAnimationTick(index, from, to) {
  return (progress) => {
    const hueShift = from + progress * (to - from);
    textures[index].options.hueShift = hueShift;
    renderer.setSize(windowWidth, windowHeight);
    renderer.render(scene, camera);
  };
}

