const flatten = require('flat');

var filterSwagger = function (inputJsonStr, options) {
    const pathRegex = new RegExp(options.includePaths);
    const definitionRegex = new RegExp(options.includeDefinitions);
    inputJson = JSON.parse(inputJsonStr);

    let definitionsMap = {};
    for (const defLocalizationName in inputJson) {
        if (isObject(inputJson[defLocalizationName])) {
            searchReferencesFor(inputJson[defLocalizationName], inputJson, definitionsMap);
        }
    }

    const paths = inputJson.paths;
    removeUnwantedKeys(paths, pathRegex);
    let whiteList = {};
    if (options.includeDefinitions) {
        saveDefinitions(definitionRegex, definitionsMap, whiteList, inputJson);
    }
    for (const path in paths) {
        searchReferencesFor(paths[path], inputJson, whiteList);
    }
    clearMismatchedElements(inputJson, definitionsMap, whiteList);
    return filterJson(inputJson, whiteList);
};

var removePath = function(inputJsonStr, options)
{
    var inputJson = JSON.parse(inputJsonStr);
    const pathRegex = new RegExp(options.pathName);

    var pathNames = Object.keys(inputJson.paths);

    for (var i = 0; i < pathNames.length; i++)
    {
        var pathName= pathNames[i];
        if(pathRegex.test(pathName))
        {
            delete inputJson.paths[pathName];
        }
    }

    return JSON.stringify(inputJson);
}

var removeDefinition = function(inputJsonStr, options)
{
    var inputJson = JSON.parse(inputJsonStr);
    var definitionRegex = new RegExp(options.definitionName);
    var definitionNames = Object.keys(inputJson.definitions);

    for (var i = 0; i < definitionNames.length; i++)
    {
        var definitionName = definitionNames[i];
        if(definitionRegex.test(definitionName))
        {
            delete inputJson.definitions[definitionName];
        }
    }

    return JSON.stringify(inputJson);
}

var removeDefinitionProperty = function(inputJsonStr, options)
{
    var inputJson = JSON.parse(inputJsonStr);
    var definitionName = options.definitionName;
    var propertyName = options.propertyName;

    if(definitionName in inputJson.definitions)
    {
        if(propertyName in inputJson.definitions[definitionName].properties)
        {
            delete inputJson.definitions[definitionName].properties[propertyName];
        }
    }
    return JSON.stringify(inputJson);
}

function removeUnwantedKeys(objectToFilter, keyRegex) {
    for (const key in objectToFilter) {
        if (!keyRegex.test(key)) {
            delete objectToFilter[key];
        }
    }
}

function saveDefinitions(definitionRegex, definitionsMap, whiteList, inputJson) {
    for (const defLocalizationName in definitionsMap) {
        for (const defName in inputJson[defLocalizationName]) {
            const nestedDefinition = inputJson[defLocalizationName][defName];
            if (definitionRegex.test(defName) && shouldSaveReference(defLocalizationName, defName, whiteList)) {
                saveReference(defLocalizationName, defName, whiteList);
                if (isObject(nestedDefinition)) {
                    searchReferencesFor(nestedDefinition, inputJson, whiteList);
                }
            }
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

function searchReferencesFor(definition, inputJson, definitionsMap) {
    const flattenDefinition = flatten(definition);
    for (const key in flattenDefinition) {
        let value = flattenDefinition[key];
        if (key.includes('$ref')) {
            const [defLocalizationName, defName] = value.slice(2).split('/');
            const nestedDefinition = inputJson[defLocalizationName][defName];
            if (shouldSaveReference(defLocalizationName, defName, definitionsMap)) {
                saveReference(defLocalizationName, defName, definitionsMap);
                if (isObject(nestedDefinition)) {
                    searchReferencesFor(nestedDefinition, inputJson, definitionsMap);
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

module.exports = {
    filterSwagger,
    removeDefinition,    
    removeDefinitionProperty,
    removePath
}