const PRETTY_TILE_ART_COLS = 11; // how many columns are in the pretty tile art sheet
const PRETTY_TILE_ART_ROWS_PER_STYLE = 3; // to compute total number for offset of alt tilesets

var tilemaskToArtIdx = undefined;
var maskShiftLookup = undefined;

//// letters after TILE_ refer to which sides have tiles adjacent
//// for consistency always listing in order (left to right, top to bottom)
//// QWE
//// ASD // coding of each is for tile at center position "S"
//// ZXC
// this order is for ease of the artist, not (clearly!) the programmer :)
const TILE_SDXC = 0;
const TILE_ASDZXC = 1;
const TILE_ASZX = 2;
const TILE_SDX = 3;
const TILE_ASDX = 4;
const TILE_ASX = 5;
const TILE_QWEASDZX = 6;
const TILE_QWEASDX = 7;
const TILE_QWEASDXC = 8;
const TILE_SX = 9;
const TILE_SD = 10;
const TILE_WESDXC = 11;
const TILE_QWEASDZXC = 12;
const TILE_QWASZX = 13;
const TILE_WSDX = 14;
const TILE_S = 15;
const TILE_WASX = 16;
const TILE_QWASDZX = 17;
const TILE_WASDX = 18;
const TILE_WEASDXC = 19;
const TILE_AS = 20;
const TILE_WS = 21;
const TILE_WESD = 22;
const TILE_QWEASD = 23;
const TILE_QWAS = 24;
const TILE_WSD = 25;
const TILE_WASD = 26;
const TILE_WAS = 27;
const TILE_QWASDZXC = 28;
const TILE_WASDZXC = 29;
const TILE_WEASDZXC = 30;
const TILE_ASD = 31;
const TILE_WSX = 32;

const SHL_Q = 0;
const SHL_W = 1;
const SHL_E = 2;
const SHL_A = 3;
const SHL_S = 4;
const SHL_D = 5;
const SHL_Z = 6;
const SHL_X = 7;
const SHL_C = 8;

function shiftMask(shiftAmt) {
  return (1 << shiftAmt);
}

function shiftMaskAll(/*accept any number*/) {
  var sumMask = 0;
  for (var i = 0; i < arguments.length; i++) {
    sumMask |= shiftMask(arguments[i]);
  }

  return sumMask;
}

/**
 * To map shift combinations into art sheet index
 */
function initArtMaskLookup() {
  if (tilemaskToArtIdx != undefined) {
    return;
  }

  maskShiftLookup = [];
  maskShiftLookup[SHL_Q] = shiftMask(SHL_Q);
  maskShiftLookup[SHL_W] = shiftMask(SHL_W);
  maskShiftLookup[SHL_E] = shiftMask(SHL_E);
  maskShiftLookup[SHL_A] = shiftMask(SHL_A);
  maskShiftLookup[SHL_S] = shiftMask(SHL_S);
  maskShiftLookup[SHL_D] = shiftMask(SHL_D);
  maskShiftLookup[SHL_Z] = shiftMask(SHL_Z);
  maskShiftLookup[SHL_X] = shiftMask(SHL_X);
  maskShiftLookup[SHL_C] = shiftMask(SHL_C);

  tilemaskToArtIdx = [];
  tilemaskToArtIdx[shiftMaskAll(SHL_S, SHL_D, SHL_X, SHL_C)] = TILE_SDXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X, SHL_C)] = TILE_ASDZXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S, SHL_Z, SHL_X)] = TILE_ASZX;
  tilemaskToArtIdx[shiftMaskAll(SHL_S, SHL_D, SHL_X)] = TILE_SDX;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S, SHL_D)] = TILE_ASD;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S, SHL_X)] = TILE_ASX;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X)] = TILE_QWEASDZX;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S, SHL_D, SHL_X)] = TILE_ASDX;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_X, SHL_C)] = TILE_QWEASDXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_S, SHL_X)] = TILE_SX;
  tilemaskToArtIdx[shiftMaskAll(SHL_S, SHL_D)] = TILE_SD;

  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_E, SHL_S, SHL_D, SHL_X, SHL_C)] = TILE_WESDXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X, SHL_C)] = TILE_QWEASDZXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_A, SHL_S, SHL_Z, SHL_X)] = TILE_QWASZX;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_S, SHL_X)] = TILE_WSX;
  tilemaskToArtIdx[shiftMaskAll(SHL_S)] = TILE_S;

  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_S, SHL_D, SHL_X)] = TILE_WSDX;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_A, SHL_S, SHL_D, SHL_X)] = TILE_WASDX;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_A, SHL_S, SHL_X)] = TILE_WASX;
  tilemaskToArtIdx[shiftMaskAll(SHL_A, SHL_S)] = TILE_AS;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_S)] = TILE_WS;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_E, SHL_S, SHL_D)] = TILE_WESD;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_E, SHL_A, SHL_S, SHL_D)] = TILE_QWEASD;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_A, SHL_S)] = TILE_QWAS;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_S, SHL_D)] = TILE_WSD;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_A, SHL_S)] = TILE_WAS;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X, SHL_C)] = TILE_QWASDZXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_A, SHL_S, SHL_D)] = TILE_WASD;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X, SHL_C)] = TILE_WEASDZXC;

  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_X)] = TILE_QWEASDX;
  tilemaskToArtIdx[shiftMaskAll(SHL_Q, SHL_W, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X)] = TILE_QWASDZX;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_E, SHL_A, SHL_S, SHL_D, SHL_X, SHL_C)] = TILE_WEASDXC;
  tilemaskToArtIdx[shiftMaskAll(SHL_W, SHL_A, SHL_S, SHL_D, SHL_Z, SHL_X, SHL_C)] = TILE_WASDZXC;
}
