// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

// new consts here:
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

// image
var imageInput = document.getElementById("image-input");

// buttons
const clear = document.querySelector("[type='reset']");
const read = document.querySelector("[type='button']");
const selectedVoice = document.getElementById('voice-selection');
selectedVoice.disabled = false;
const submit = document.querySelector("[type='submit']"); // also need to turn submit off.

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
   
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

  ctx.clearRect(0,0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  var dims = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);

  submit.disabled = false;
  clear.disabled = true;
  read.disabled = true;

});

// image-input on change
imageInput.addEventListener('change', () => {
    img.src = URL.createObjectURL(imageInput.files[0]);
    img.alt = imageInput.files[0];
});


// can directly get by id.
const generate = document.getElementById('generate-meme');
const texTop = document.getElementById('text-top');
const texBot = document.getElementById('text-bottom');
generate.addEventListener('submit', (event) => {
    // The generated meme only occurs 1/10 second
    // After some research, we know we should add this code.
    event.preventDefault();

    ctx.fillStyle = "blue";
    ctx.font = 'bold 50px serif';
    ctx.textBaseline = "top";
    // since we want it to be centered
    ctx.fillText(texTop.value, canvas.width / 2, 10);
  
    ctx.textBaseline = "bottom";
    ctx.fillText(texBot.value, canvas.width / 2, 390);
    
    // after generate meme, generate is disabled and other 2 are turned on.
    submit.disabled = true;
    clear.disabled = false;
    read.disabled = false;
})


// clear button: clean up and change button
clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    texTop.value = null;
    texBot.value = null;
    // no img selected, cannot submmit
    submit.disabled = false;
    clear.disabled = true;
    read.disabled = true;
}); 


// Helper function populateVoiceList
// Mostly copied from https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis#specifications
var synth = window.speechSynthesis;

// already have getElementById 'voice-selection' as volume
var voices = [];
function populateVoiceList() {
  voices = synth.getVoices();

  for (let i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    selectedVoice.appendChild(option);
  }
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}


// toggle volume icon before read
// (I guess people will adjust volume before clicking read.)
const volGroup = document.getElementById('volume-group');
const icon = document.querySelector("[alt='Volume Level 3']");
const volumeValue = document.querySelector("[type='range']");
volGroup.addEventListener('input', () => {
    if (volumeValue.value <= 100 && volumeValue.value >= 67) {
      icon.src = "icons/volume-level-3.svg";
    }
    else if (volumeValue.value >= 34 && volumeValue.value <= 66) {
      icon.src = "icons/volume-level-2.svg";
    }
    else if (volumeValue.value >= 1 && volumeValue.value <= 33) {
      icon.src = "icons/volume-level-1.svg";
    }
    else if (volumeValue.value == 0) {
      icon.src = "icons/volume-level-0.svg";
    }
})

// read on click
read.addEventListener('click', () => {
    // Why this line is useless (have line across event)
    // event.preventDefault();

    var toRead = new SpeechSynthesisUtterance(texTop.value + texBot.value);
    var selectedOption = selectedVoice.selectedOptions[0].getAttribute('data-name');
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        toRead.voice = voices[i];
      }
    }
    toRead.volume = volumeValue.value /100 ; // volume should be 0-1
    synth.speak(toRead);
    texTop.blur();
    texBot.blur();
})



/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

