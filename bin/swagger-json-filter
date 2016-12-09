#!/usr/bin/env node
const swaggerJsonFilter = require('../src/index');

const stdin = process.openStdin();
let inputJson = '';
stdin.on('data', function (chunk) {
    inputJson += chunk;
});

stdin.on('end', function () {
    const output = swaggerJsonFilter(inputJson, getProgram());
    console.log(output);
});

function getProgram() {
    let program = require('commander');
    program.option('-i, --include-paths <include-paths>', 'Keep only paths matching the given JavaScript regex')
        .parse(process.argv);
    return program;
}