#!/usr/bin/env node
const program = require('commander');
const flatten = require('flat');

program
    .option('-i, --include-paths <include-paths>', 'Get only this paths')
    .parse(process.argv);

let stdin = process.openStdin();

let inputJson = '';

stdin.on('data', function (chunk) {
    inputJson += chunk;
});

stdin.on('end', function () {
    main(inputJson);
});

function main(inputJson) {
    const includePath = 'paths';
    const pathRegex = new RegExp(program.includePaths);
    inputJson = JSON.parse(inputJson);
    let localizationOfReferences = {};
    for (const element in inputJson[includePath]) {
        searchReferencesFor(inputJson[includePath][element], inputJson, localizationOfReferences);
    }

    let whiteList = {};
    for (const key in inputJson[includePath]) {
        if (!pathRegex.test(key)) {
            delete inputJson[includePath][key];
        }
    }
    for (const element in inputJson[includePath]) {
        searchReferencesFor(inputJson[includePath][element], inputJson, whiteList);
    }

    for (let key in localizationOfReferences) {
        if (!whiteList.hasOwnProperty(key)) {
            inputJson[key] = {};
        }
    }
    filterJson(inputJson, whiteList);
}

function isObject(value) {
    return (typeof value === 'object');
}

function modifyLocalizationOfReferences(majorKey, furtherKey, localizationOfReferences) {
    if (!localizationOfReferences.hasOwnProperty(majorKey)) {
        localizationOfReferences[majorKey] = [];
        localizationOfReferences[majorKey].push(furtherKey);
        return true;
    } else if (localizationOfReferences[majorKey].indexOf(furtherKey) < 0) {
        localizationOfReferences[majorKey].push(furtherKey);
        return true;
    }
    return false;
}

function searchReferencesFor(element, inputJson, localizationOfReferences) {
    const flattenElement = flatten(element);
    for (const key in flattenElement) {
        let value = flattenElement[key];
        if (key.includes('$ref')) {
            const [majorKey, furtherKey] = value.slice(2).split('/');
            const next = inputJson[majorKey][furtherKey];
            if (modifyLocalizationOfReferences(majorKey, furtherKey, localizationOfReferences) && isObject(next)) {
                searchReferencesFor(next, inputJson, localizationOfReferences);
            }
        } else {
        }
    }
}

function filterJson(inputJson, localizationOfReferences) {
    for (const majorKey in localizationOfReferences) {
        let whiteKeys = localizationOfReferences[majorKey];
        for (const key in inputJson[majorKey]) {
            if (whiteKeys.indexOf(key) < 0) {
                delete inputJson[majorKey][key];
            }
        }
    }
    const outputJson = JSON.stringify(inputJson);
    console.log(outputJson);
}

