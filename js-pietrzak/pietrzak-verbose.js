/*
  Pietrzak Verifiable Delay Function for integer
  input and parameters.
  Evalulation and Verification implemented.

  -input t value to determine T=2^t
  -s is eval proof construct parameter
*/

const bigInt = require('big-integer');
const quad_res = require('./quad_residues');
const Web3Utils = require('web3-utils');

/*
  Perform Pietrzak evaluation with input x and
  VDF parameters N,t,s
*/
exports.eval = function(x,N,t,s) {
  var T = bigInt(2).pow(t);
  var y = new bigInt();
  var s_values = [];

  console.log("\nEVAL");
  y = x; //init y

  //eval and store every T/(2^s) interval for proof construction
  expo = bigInt(2).pow(T.divide(bigInt(2**s)));
  for (i=1; i<=2**s; i++) {
    y = y.modPow(expo,N);
    s_values.push(y);
  }

  console.log("stored values: "+s_values);
  console.log("x: "+x.toString()+" y: "+y.toString());

  //construct proof
  var proof = [];
  proof = constructProof(x,N,t,s,s_values);
  return [y,proof]
}

function constructProof(x,N,t,s,s_values) {
  var xi = x;
  var yi = s_values[2**s];
  var T = bigInt(2).pow(t);
  var Ti = T;
  var ui;
  var ri;
  var proof = [];
  var r_values = [];

  console.log("\n\n-----CONSTRUCT-----");
  //get each ui,xi,yi to find ri for i up to s
  for (i=1; i<=s; i++) {
    console.log("\nconstruct i: "+i+" s: "+s);
    //calculate ui
    ui = getu(N,i,s_values,r_values);
    console.log("ui: "+ui);

    //add to proof array
    proof.push(ui);

    //calculate xi
    xi = getx(x,N,i,s_values,r_values);
    console.log("xi: "+xi);

    //calculate yi
    yi = gety(N,i,s_values,r_values);
    console.log("yi: "+yi);

    Ti = T.divide(bigInt(2).pow(i-1));
    console.log("T/2^(i-1): "+Ti);

    // calculate ri
    ri = performHash(xi,Ti,yi,ui,N);
    console.log("ri: "+ri);
    r_values.push(ri);
  }

  //find remaining proofs ui for i=s+1...t by recomputation
  for (i=s+1; i<=t; i++) {
    console.log("\nconstruct i: "+i);
    //calculate next xi,yi
    xi = (xi.modPow(ri,N)).times(ui).mod(N);
    console.log("xi: "+xi);
    yi = (ui.modPow(ri,N)).times(yi).mod(N);
    console.log("yi: "+yi);

    //calculate ui from xi
    ui = xi.modPow(bigInt(2).pow(T.divide(bigInt(2).pow(i))),N);
    console.log("ui: "+ui);
    proof.push(ui);

    Ti = T.divide(bigInt(2).pow(i-1));
    console.log("Ti: "+Ti);

    //find and store ri
    ri = performHash(xi,Ti,yi,ui,N);
    r_values.push(ri);
    console.log("ri: "+ri);
  }

  console.log("\nr_values: "+r_values);
  console.log("proof: "+proof);
  return proof;
  }

function getu(N,i,s_values,r_values) {
  // store r values
  var elem_ri = [];
  // store x^2^(aT/b) = c
  var elem_c = [];
  switch (i) {
    case 1:
      elem_c = [s_values[3]];
      elem_ri = [1]
      break;
    case 2:
      elem_c = [s_values[1],s_values[5]];
      elem_ri =  [r_values[i-2],1];
      break;
    case 3:
      elem_c = [s_values[0],s_values[4],s_values[2],s_values[6]]
      elem_ri = [r_values[i-2].times(r_values[i-3]),r_values[i-2],r_values[i-3],1];
      break;
    default:
      console.log("ERROR: getu invalid i: "+i);
    }

    // console.log("elem_ri: "+elem_ri);
    // console.log("elem_c: "+elem_c);
    //multiply x^expo[j]
    var res = new bigInt(1);
    for (j=0; j<2**(i-1); j++) {
      res = res.times(elem_c[j].modPow(elem_ri[j],N)).mod(N);
      // console.log(res);
    }
    return res;
}
function getx(x,N,i,s_values,r_values) {
  // store r values
  var elem_ri = [];
  // store x^2^(aT/b) = c
  var elem_c = [];
  switch (i) {
    case 1:
      elem_c = [x]
      elem_ri = [1];
      break;
    case 2:
      elem_c = [x, s_values[3]];
      elem_ri = [r_values[i-2], 1];
      break;
    case 3:
      elem_c = [x, s_values[3], s_values[1], s_values[5]];
      elem_ri = [r_values[i-2].times(r_values[i-3]),r_values[i-2],r_values[i-3],1];
      break;
    default:
      console.log("ERROR: getx invalid i: "+i);
    }

    // console.log("elem_ri: "+elem_ri);
    // console.log("elem_c: "+elem_c);
    //multiply x^expo[j]
    var res = new bigInt(1);
    for (j=0; j<2**(i-1); j++) {
      res = res.times(elem_c[j].modPow(elem_ri[j],N)).mod(N);
      // console.log(res);
    }
    return res;
  }
function gety(N,i,s_values,r_values) {
  // store x^2^(aT/b) = c
  var elem_c = [];
  // store r values
  var elem_ri = [];
  switch (i) {
    case 1:
      elem_c = [s_values[7]];
      elem_ri = [1];
      break;
    case 2:
      elem_c = [s_values[3], s_values[7]];
      elem_ri = [r_values[i-2], 1];
      break;
    case 3:
      elem_c = [s_values[1], s_values[5], s_values[3], s_values[7]];
      elem_ri = [r_values[i-2].times(r_values[i-3]),r_values[i-2],r_values[i-3],1];
      break;
    default:
      console.log("ERROR: gety invalid i: "+i);
    }

    // console.log("elem_ri: "+elem_ri);
    // console.log("elem_c: "+elem_c);
    //multiply x^expo[j]
    var res = new bigInt(1);
    for (j=0; j<2**(i-1); j++) {
      res = res.times(elem_c[j].modPow(elem_ri[j],N)).mod(N);
      // console.log(res);
    }
    return res;
}

/*
  Perform Pietrzak verification with input x, proof proof
  and VDF parameters N,t
*/
exports.verify = function(x,N,t,y,proof) {
  var T = bigInt(2).pow(t);
  var Ti = bigInt(T);
  var xi = bigInt(x);
  var yi = bigInt(y);

  /*
    Shouldnt computer quad. res. set on-the-fly.
    Do once and store for N used by VDF in system.
    Included for completeness
  */
  if (!quad_res.checkInSet(x,y,N,proof)) {
    return;
  }

  console.log("\n\nVERIFY");
  //find each r,xi,yi and use to find next
  //up until i=t
  for (i=1; i<=t;i++) {
    console.log("\ni = "+i)
    console.log("xi: "+xi+" yi: "+yi);
    //for each u_prime
    ui = bigInt(proof[i-1]);
    console.log("\nui: "+ui);

    Ti = T.divide(bigInt(2).pow(i-1));
    console.log("Ti: "+Ti);

    r = performHash(xi,Ti,yi,ui,N)
    console.log("r: "+r);

    xi = (xi.modPow(r,N)).times(ui).mod(N);
    console.log("xi+1: "+xi);
    yi = (ui.modPow(r,N)).times(yi).mod(N);
    console.log("yi+1: "+yi);
  }
  //check proof validity
  if (yi.compare(xi.modPow(2,N)) == 0) {
    return true;
  }
  return false;
}

/*
  Perform hash of all values concaternanted.
  sha3 algorithm as implemented in Solidity as keccak256.
*/
function performHash(xi,Ti,yi,ui,N) {
  var r = Web3Utils.soliditySha3({type: 'uint', value: xi.toJSNumber().toString()},{type: 'uint', value: Ti.toJSNumber().toString()},{type: 'uint', value: yi.toJSNumber().toString()},{type: 'uint', value: ui.toJSNumber().toString()});
  //remove hex notation '0x'
  r = r.toString().substring(2,r.length);
  //convert from base 16
  r = bigInt(r,16);
  r = r.mod(N);
  return r;
}
