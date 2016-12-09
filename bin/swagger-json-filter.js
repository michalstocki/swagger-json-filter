#!/usr/bin/env node
const flatten = require('flat');

let stdin = process.openStdin();

let inputJson = '';

stdin.on('data', function (chunk) {
    inputJson += chunk;
});

stdin.on('end', function () {
    main(inputJson);
});

function main(inputJson) {
    const filterKey = 'paths';
    const pathRegex = createPathRegex(getProgram().includePaths);

    inputJson = JSON.parse(inputJson);
    let localizationOfReferences = {};
    for (const element in inputJson[filterKey]) {
        searchReferencesFor(inputJson[filterKey][element], inputJson, localizationOfReferences);
    }
    removeUnnecessaryElements(inputJson, filterKey, pathRegex);
    let whiteList = {};
    for (const element in inputJson[filterKey]) {
        searchReferencesFor(inputJson[filterKey][element], inputJson, whiteList);
    }

    clearMismatchedElements(inputJson, localizationOfReferences, whiteList);
    filterJson(inputJson, whiteList);
}

function getProgram() {
    let program = require('commander');
    program.option('-i, --include-paths <include-paths>', 'Get only this paths')
        .parse(process.argv);
    return program;
}

function createPathRegex(str) {
    return new RegExp(str);
}

function removeUnnecessaryElements(inputJson, filterKey, regexObj) {
    for (const key in inputJson[filterKey]) {
        if (!regexObj.test(key)) {
            delete inputJson[filterKey][key];
        }
    }
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
        }
    }
}

function clearMismatchedElements(obj, someList, whiteList) {
    for (let key in someList) {
        if (!whiteList.hasOwnProperty(key)) {
            obj[key] = {};
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

