//Prevents player from drag selecting
document.onselectstart = function() {
  window.getSelection().removeAllRanges();
};

//Prevents player from drag selecting
document.onmousedown = function() {
  window.getSelection().removeAllRanges();
};

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_W = 87;
const KEY_S = 83;
const KEY_A = 65;
const KEY_D = 68;

function setupInput() {
  document.addEventListener('keydown', keyPressed);
  document.addEventListener('keyup', keyReleased);
}

function keyPressed(event) {
  keySet(event, true);
}

function keyReleased(event) {
  keySet(event, false);
}

function keySet(event, setTo) {
  if (event.keyCode == KEY_A || event.keyCode == KEY_LEFT_ARROW) {
    Ship.keyHeld_W = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_D || event.keyCode == KEY_RIGHT_ARROW) {
    Ship.keyHeld_E = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_W || event.keyCode == KEY_UP_ARROW) {
    Ship.keyHeld_N = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_S || event.keyCode == KEY_DOWN_ARROW) {
    Ship.keyHeld_S = setTo;
    event.preventDefault();
  }
}
