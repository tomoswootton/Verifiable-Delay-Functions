# Pietrzak Verifiable Delay Function

Reference: https://eprint.iacr.org/2018/627.pdf

## Install dependencies

npm: https://www.npmjs.com/

Install big-integer: `npm i big-integer`

Install web3-utils: `npm i web3-utils`

## Pietrzak.js
Implementation of Evaluation and Verification algorithms.

* Input x must be quadratic residue of N 
* N = pq where p,q are safe primes
* Integer input and parameters
* Input t value to determine T=2^t
* s={1,2,3} is eval proof construct parameter

## quad_residues.js
Helper code to find and check quadratic residues for some N.
