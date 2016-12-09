const flatten = require('flat');

module.exports = function (inputJson, options) {
    const pathRegex = new RegExp(options.includePaths);
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
    return filterJson(inputJson, whiteList);
};

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
    return JSON.stringify(inputJson);
}

