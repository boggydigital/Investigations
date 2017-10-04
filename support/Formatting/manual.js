"use strict";

// manual.js builds on top of automated.js and defines a set of convenience
// methods that allow running any/all tests using manualDriver.html page.
// It defines human readable names for the actions and parameters, as well as generations

let latestTestValue = $("latestTestValue");
let latestResultValue = $("latestResultValue");
let detailedRunAllResults = $("detailedRunAllResults");
let focusReceiver = $("focusReceiver");
let detailsManualControls = document.querySelector("details#manualControls");
let actions = detailsManualControls && detailsManualControls.getAttribute("data-actions").split(",");
let parameters = detailsManualControls && detailsManualControls.getAttribute("data-parameters").split(",");
let manualControlsContainer = detailsManualControls && detailsManualControls.querySelector("#manualControlsContainer");

let actionNamesMap = new Map();
actionNamesMap.set("addClass", "Add .class");
actionNamesMap.set("removeClass", "Remove .class");
actionNamesMap.set("setId", "Set #id");
actionNamesMap.set("clearId", "Clear #id");
actionNamesMap.set("setAttributeValue", "Set [attribute=value]");
actionNamesMap.set("removeAttribute", "Remove [attribute]");
actionNamesMap.set("focus", "focus()");
actionNamesMap.set("pseudoElementFocus", "focus() with :focus::pseudo rule")
actionNamesMap.set("setCssTextSame", "Set .cssText to the same value");
actionNamesMap.set("setTransformThenGetTransformOrigin", "Set transform and get transformOrigin");

let contextNamesMap = new Map();
contextNamesMap.set("noAuthorRule", "NONE");
contextNamesMap.set("containerAuthorRule", "ONE");
contextNamesMap.set("rowAuthorRule", "FEW");
contextNamesMap.set("columnAuthorRule", "MANY");
contextNamesMap.set("cellAuthorRule", "MOST");

let generationsMap = new Map();
generationsMap.set("addClass", 1);
generationsMap.set("removeClass", 1);
generationsMap.set("setId", 1);
generationsMap.set("clearId", 1);
generationsMap.set("focus", 2);
generationsMap.set("pseudoElementFocus", 2);
generationsMap.set("setAttributeValue", 3);
generationsMap.set("removeAttribute", 3);
generationsMap.set("setCssTextSame", 4);
generationsMap.set("setTransformThenGetTransformOrigin", 4);

let createManualControls = function (options) {
    actions.forEach(s => {
        let section = document.createElement("section");
        section.id = s;
        let header = document.createElement("h1");
        let sectionTitle = actionNamesMap.get(s);
        if (!sectionTitle) alert("Unknown section " + s + ", did you add it to sectionNamesMap?");
        header.textContent = sectionTitle;
        section.appendChild(header);
        let generation = generationsMap.get(s);

        parameters.forEach(b => {
            let button = document.createElement("button");
            button.textContent = contextNamesMap.get(b);
            button.setAttribute("data-value", b);
            button.classList.add("gen" + generation);
            section.appendChild(button);
        });
        manualControlsContainer.appendChild(section);
    });
    if (options && options.addEventListeners) addManualControlsEventListeners();
}

let addManualControlsEventListeners = function () {
    let buttons = document.querySelectorAll("button");
    for (let ii = 0; ii < buttons.length; ii++)
        buttons[ii].addEventListener("click", function (e) {

            if (e.target.id === "runAll") {
                runAll(true);
                return;
            }

            let action = e.target.parentNode.id;
            let parameter = e.target.getAttribute("data-value");

            detailedRunAllResults.innerHTML = "";
            latestTestValue.textContent =
                "Modification: " + actionNamesMap.get(action) +
                "; affects: " + contextNamesMap.get(parameter);
            latestResultValue.textContent = "(running...)";

            setTimeout(() => {
                let latestResult = runTestCase(
                    {
                        "action": action,
                        "parameter": parameter,
                        "cleanup": true
                    });
                latestResultValue.textContent = latestResult.toFixed(2);
            }, 50);

        });
};

let createGenerationsControls = function (options) {
    let generations = [];
    let generationsControls = $("generationsControls");
    generationsMap.forEach((value, key) => {
        if (generations.indexOf(value) === -1) generations.push(value);
    });

    generations.forEach(generation => {
        let generationId = "gen" + generation;
        let generationLabel = document.createElement("label");
        generationLabel.textContent = generation;
        generationLabel.classList.add(generationId);
        let generationCheckbox = document.createElement("input");
        generationCheckbox.type = "checkbox";
        if (options && options.selectGenerations.indexOf(generation) > -1) generationCheckbox.checked = true;
        generationCheckbox.id = generationId;
        generationCheckbox.setAttribute("data-generation", generation);
        generationLabel.appendChild(generationCheckbox);
        generationsControls.appendChild(generationLabel);
    })
}

let getSelectedGenerations = function () {
    let generations = [];
    let generationCheckboxes = document.querySelectorAll("#generationsControls input[type='checkbox']");

    for (let cc = 0; cc < generationCheckboxes.length; cc++) {
        let checkbox = generationCheckboxes[cc];
        if (checkbox.checked) generations.push(parseInt(checkbox.getAttribute("data-generation")));
    }

    return generations;
}

let runAll = function (outputData) {
    let generations = getSelectedGenerations();
    let totalElapsed = 0;
    let resultsTable = {};
    if (outputData) {
        latestTestValue.textContent = "All selected";
        latestResultValue.textContent = "(running...)";
    }
    setTimeout(() => {
        actions.forEach(section => {
            let testCaseGeneration = generationsMap.get(section);
            if (generations.indexOf(testCaseGeneration) !== -1) {
                resultsTable[section] = {};
                parameters.forEach(button => {
                    let latestResult = runTestCase(
                        {
                            "action": section,
                            "parameter": button,
                            "cleanup": true
                        });
                    resultsTable[section][button] = latestResult;
                    totalElapsed += latestResult;
                })
            }
        })
        if (outputData) {
            latestResultValue.textContent = totalElapsed.toFixed(2);
            outputRunAllResultsTable(resultsTable);
        }
        console.table(resultsTable);
    }, 50);
}

let outputRunAllResultsTable = function (data) {
    let columnsCreated = false;
    detailedRunAllResults.innerHTML = "";

    for (let row in data) {
        if (!columnsCreated) {
            let tableHead = document.createElement("thead");
            tableHead.appendChild(document.createElement("th"))
            for (let column in data[row]) {
                let columnHeader = document.createElement("th");
                columnHeader.innerHTML = contextNamesMap.get(column);
                tableHead.appendChild(columnHeader);
            }
            let sumHeader = document.createElement("th");
            sumHeader.textContent = "SUM";
            tableHead.appendChild(sumHeader);

            detailedRunAllResults.appendChild(tableHead);
            columnsCreated = true;
        }

        let tableRow = document.createElement("tr");
        let tableRowTitle = document.createElement("td");
        tableRowTitle.innerHTML = "<h1>" + actionNamesMap.get(row) + "</h1>";
        tableRowTitle.classList.add("gen" + generationsMap.get(row));
        tableRow.appendChild(tableRowTitle);

        let columnTotal = 0;
        for (let column in data[row]) {
            columnTotal += data[row][column];
            let tableRowColumnValue = document.createElement("td");
            tableRowColumnValue.textContent = data[row][column].toFixed(2);
            tableRow.appendChild(tableRowColumnValue);
        }

        let sumColumnRow = document.createElement("td");
        sumColumnRow.textContent = columnTotal.toFixed(2);
        tableRow.appendChild(sumColumnRow);

        detailedRunAllResults.appendChild(tableRow);
    }
}

let checkConsistency = function () {
    let length = actionNamesMap.size;
    let result = "";

    if (actionsMap.size !== length ||
        generationsMap.size !== length)
        result += "actionsMap or generationsMap size is differnt from sectionNamesMap size.\n" +
            "Did you add new case to all of the maps?";

    actionNamesMap.forEach((value, key) => {
        if (!actionsMap.get(key)) result += "actionsMap doesn't contain " + key;
        if (!generationsMap.get(key)) result += "generationsMap doesn't contain " + key;
    })

    return result;
}