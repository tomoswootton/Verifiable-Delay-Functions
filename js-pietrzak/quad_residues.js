const bigInt = require('big-integer');

/*
  function returns true if x,y and all elements in proof are
  quadratic residues mod N
*/
exports.checkInSet = function(x,y,N,proof) {
  quad_residues = findQuadraticResidues(N).toString();
  // console.log(quad_residues);
  if (!(quad_residues.includes(x.toString()))) {
    console.log("x: "+x+" not a quadratic residue");
    return false;
  } else if (!(quad_residues.includes(y.toString()))) {
    console.log("y not a quadratic residue");
    return false;
  }
  for (var i=0; i<proof.length; i++) {
    if (!(quad_residues.includes(i.toString()))) {
      console.log("u"+i+" not a quadratic residue");
      return false;
    }
  }
  return true;
}

/*
    calculate all quadratic residues mod N
*/
function findQuadraticResidues(N) {
  var result = [];
  for (i=1; i<N; i++) {
    result.push(bigInt(i).modPow(bigInt(2),N));
  }
  result.sort((a,b) => a-b);
  return result = arrayRemoveDuplicates(result);
}

/*
  helper function removes duplicates in array
*/
function arrayRemoveDuplicates(array) {
    var unique = {};
    var result = [];
    for (var i=0; i<array.length; i++) {
      if (!(array[i] in unique)) {
        result.push(array[i]);
        unique[array[i]] = true;
      }
    }
    return result;
}
