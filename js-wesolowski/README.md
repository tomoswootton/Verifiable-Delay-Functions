# Wesolowski Verifiable Delay Function for integer input and parameters.

Reference: https://eprint.iacr.org/2018/623.pdf

## Install dependencies

npm: https://www.npmjs.com/
Install big-integer: `npm i big-integer`
Install web3-utils: `npm i web3-utils`

## Setup
**User must provide list of primes up to N and point to list in getlValue().**

## Wesolowski.js
Implementation of Evaluation and Verification algorithms.
-Time parameter T where T=2^t
-proof construction variable k must divide t
