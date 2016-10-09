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

const KEY_ENTER = 13;
const KEY_SPACE = 32;

const KEY_W = 87;
const KEY_S = 83;
const KEY_A = 65;
const KEY_D = 68;

const KEY_R = 82;
const KEY_T = 84;
const KEY_G = 71;
const KEY_Y = 89;
const KEY_H = 72;
const KEY_U = 85;
const KEY_I = 73;
const KEY_J = 74;
const KEY_K = 75;
const KEY_N = 78;
const KEY_M = 77;
const KEY_0 = 48;

const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;
const KEY_6 = 54;
const KEY_B = 66;
const KEY_L = 76;
const KEY_O = 79;
const KEY_P = 80;

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
  if (debug_editor) {
    return;
  }

  if (event.keyCode == KEY_A || event.keyCode == KEY_LEFT_ARROW) {
    Ship.keyHeld_W = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_D || event.keyCode == KEY_RIGHT_ARROW) {
    Ship.keyHeld_E = setTo;
    Grid.keyHeld_E = setTo;
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

  Grid.keyHeld = setTo;
  if (Ship.isDead) {
    Ship.keyHeld = setTo;
  }
}

function preventSpacebarScroll(event) {
  if (event.keyCode == KEY_SPACE) {
    event.preventDefault();
  }
}
document.addEventListener('keydown', preventSpacebarScroll);
document.addEventListener('keyup', preventSpacebarScroll);
