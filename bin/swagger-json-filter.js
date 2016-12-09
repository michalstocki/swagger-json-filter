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
    const pathRegex = new RegExp(getProgram().includePaths);
    inputJson = JSON.parse(inputJson);
    const paths = inputJson.paths;

    let definitionsMap = {};
    for (const path in paths) {
        searchReferencesFor(paths[path], inputJson, definitionsMap);
    }
    removeUnwantedKeys(paths, pathRegex);
    let whiteList = {};
    for (const path in paths) {
        searchReferencesFor(paths[path], inputJson, whiteList);
    }

    clearMismatchedElements(inputJson, definitionsMap, whiteList);
    filterJson(inputJson, whiteList);
}

function getProgram() {
    let program = require('commander');
    program.option('-i, --include-paths <include-paths>', 'Get only this paths')
        .parse(process.argv);
    return program;
}

function removeUnwantedKeys(objectToFilter, keyRegex) {
    for (const key in objectToFilter) {
        if (!keyRegex.test(key)) {
            delete objectToFilter[key];
        }
    }
}

function isObject(value) {
    return (typeof value === 'object');
}

function saveReference(defLocalizationName, defName, definitionsMap) {
    definitionsMap[defLocalizationName] = definitionsMap[defLocalizationName] || [];
    definitionsMap[defLocalizationName].push(defName);
}

function shouldSaveReference(defLocalizationName, defName, definitionsMap) {
    return !definitionsMap[defLocalizationName] || definitionsMap[defLocalizationName].indexOf(defName) < 0;
}

function searchReferencesFor(element, inputJson, definitionsMap) {
    const flattenElement = flatten(element);
    for (const key in flattenElement) {
        let value = flattenElement[key];
        if (key.includes('$ref')) {
            const [defLocalizationName, defName] = value.slice(2).split('/');
            const next = inputJson[defLocalizationName][defName];
            if (shouldSaveReference(defLocalizationName, defName, definitionsMap)) {
                saveReference(defLocalizationName, defName, definitionsMap);
                if (isObject(next)) {
                    searchReferencesFor(next, inputJson, definitionsMap);

                }
            }
        }
    }
}

function clearMismatchedElements(obj, someList, whiteList) {
    for (const key in someList) {
        if (!whiteList.hasOwnProperty(key)) {
            obj[key] = {};
        }
    }
}

function filterJson(inputJson, definitionsMap) {
    for (const defLocalizationName in definitionsMap) {
        let expectedDefNames = definitionsMap[defLocalizationName];
        for (const key in inputJson[defLocalizationName]) {
            if (expectedDefNames.indexOf(key) < 0) {
                delete inputJson[defLocalizationName][key];
            }
        }
    }
    const outputJson = JSON.stringify(inputJson);
    console.log(outputJson);
}

