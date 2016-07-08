//Prevents player from drag selecting
document.onselectstart = function()
{
  window.getSelection().removeAllRanges();
};

//Prevents player from drag selecting
document.onmousedown = function()
{
  window.getSelection().removeAllRanges();
};

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;
const KEY_6 = 54;

const KEY_W = 87;
const KEY_S = 83;
const KEY_A = 65;
const KEY_D = 68;
const KEY_SPACE = 32;

function setupInput() {
  document.addEventListener('keydown', keyPressed);
  document.addEventListener('keyup', keyReleased);
}

function keyPressed(event) {
  console.log(event.keyCode);
  keySet(event, true);
}

function keyReleased(event) {
  keySet(event, false);
}

function keySet(event, setTo) {
  if (event.keyCode == KEY_A || event.keyCode == KEY_RIGHT_ARROW) {
    Ship.keyHeld_W = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_D || event.keyCode == KEY_LEFT_ARROW) {
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
  if (event.keyCode == KEY_SPACE) {
    Ship.keyHeld_SPACE = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_1) {
    Ship.keyHeld_1 = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_2) {
    Ship.keyHeld_2 = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_3) {
    Ship.keyHeld_3 = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_4) {
    Ship.keyHeld_4 = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_5) {
    Ship.keyHeld_5 = setTo;
    event.preventDefault();
  }
  if (event.keyCode == KEY_6) {
    Ship.keyHeld_6 = setTo;
    event.preventDefault();
  }
}
