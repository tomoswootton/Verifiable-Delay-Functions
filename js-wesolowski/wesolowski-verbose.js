/*
  Wesolowski Verifiable Delay Function for integer
  input and parameters.
  Evalulation and Verification implemented.

  **User must provide list of primes up to N and point
  to list in getlValue().**

  -Time parameter T where T=2^t
  -proof construction variable k must divide t
*/
const bigInt = require('big-integer');
const Web3Utils = require('web3-utils');

/*
  Perform Wesolowski evaluation with input x and
  VDF parameters N,t,k
*/
exports.eval = function(x,N,t,k) {
  if (t % k != 0) {
    console.log("ERROR: k: "+k+" does not divide t: "+t+".");
    return null;
  }

  console.log("\nEVAL");
  var y = new bigInt();
  var g = new bigInt(gPerformHash(x,N));

  console.log("x: "+x+" t: "+t+" k: "+k);

  var s_values = [];

  y = g; //init y
  s_values.push(y);
  // store y at every k interval
  for (i=1; i<=t; i++) {
    y = y.modPow(bigInt(2),N);
    if (i % k == 0) {
      s_values.push(y);

    }
  }
  console.log("stored values: "+s_values);
  console.log("y: "+y+" g: "+g+" t: "+t+" k: "+k);

  var pi = constructProof(g,N,t,y,k,s_values);
  return [y,pi];
}

/*
  function called from Eval().
  -Build proof from (t/k) number of s_values
*/
function constructProof(g,N,t,y,k,s_values) {
  console.log("\nCONSTRUCT")
  var pi = new bigInt(1);
  var l = new bigInt();
  var r = new bigInt();
  var b_values = [];

  //find l
  l = getlValue(y,g,N);

  //make bi's
  var bi = new bigInt();
  for (i=0; i<t/k; i++) {
    bi = bigInt(2).pow(k).times(bigInt(2).modPow(t-k*(i+1),l)).divide(l);
    b_values.push(bi);
  }

  console.log("b_values: "+b_values);

  //find pi
  var i_values = [];
  var elem = new bigInt(1);
  for (b=0; b<=bigInt(2).pow(k)-1; b++) {
    i_values = b_values.map((e, i) => e == b ? i : '').filter(String);
    console.log("\nb: "+b+" i_values: "+i_values);
    elem = bigInt(1);
    for (let i of i_values) {
      elem = elem.times(s_values[i]);
    }
    console.log("elem1: "+elem);
    elem = elem.pow(b).mod(N);
    console.log("elem2: "+elem);
    pi = pi.times(elem).mod(N);
    console.log("pi: "+pi);
  }
  return pi;
}

function getlValue(y,g,N) {
  var l = new bigInt();
  l = lPerformHash(y,g,N);
  //where primesList points to a user supplied file
  //containing a list of primes up to N
  var primesList = TODO;
  //and getPrime(l) gets the l'th value in primesList
  l = primesList[l];
  return l;
}
/*
  Perform Wesolowski verification with input x, proof pi
  and VDF parameters N,t,k
*/
exports.verify = function(x,N,t,y,pi) {
  var l = new bigInt();
  console.log("\nVERIFY")

  //find g
  var g = new bigInt(gPerformHash(x,N));
  //find l
  l = getlValue(y,g,N);
  //find r
  r = bigInt(2).modPow(t,l);

  //check (pi^l)(g^r) ==y
  var b = pi.modPow(l,N).times(g.modPow(r,N)).mod(N);
  console.log("b: "+b+" y: "+y);
  if ((pi.modPow(l,N).times(g.modPow(r,N)).mod(N)).compare(y)==0) {
    return true;
  }
  return false;
}

/*
  Perform hash of all values concaternanted.
  sha3 algorithm as implemented in Solidity as keccak256.
*/
function gPerformHash(x,N) {
  var r = Web3Utils.soliditySha3({type: 'uint', value: x.toJSNumber().toString()});
  r = r.toString().substring(2,r.length);
  r = bigInt(r,16);
  r = r.mod(N);
  return r;
}
function lPerformHash(y,g,N) {
  var r = Web3Utils.soliditySha3({type: 'uint', value: y.toJSNumber().toString()},{type: 'uint', value: g.toJSNumber().toString()});
  r = r.toString().substring(2,r.length);
  r = bigInt(r,16);
  r = r.mod(N);
  return r;
}
