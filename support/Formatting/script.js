let $ = function (id) { return document.getElementById(id); }

let container = $("container");
let latestTestValue = $("latestTestValue");
let latestResultValue = $("latestResultValue");
let detailedRunAllResults = $("detailedRunAllResults");
let focusReceiver = $("focusReceiver");
let detailsManualControls = document.querySelector("details#manualControls");
let sections = detailsManualControls.getAttribute("data-sections").split(",");
let buttons = detailsManualControls.getAttribute("data-buttons").split(",");
let manualControlsContainer = detailsManualControls.querySelector("#manualControlsContainer");
let column, row, cell, firstRow;

let createInitialStructure = function (options) {

    let rows = 0, columns = 0, cells = 0;
    let defaultDepth = 50;

    if (!options) {
        rows = defaultDepth;
        columns = defaultDepth;
        cells = defaultDepth;
    } else {
        rows = (options.rows) ? options.rows : defaultDepth;
        columns = (options.columns) ? options.columns : defaultDepth;
        cells = (options.cells) ? options.cells : defaultDepth;
    }

    for (let rr = 0; rr < rows; rr++) {
        let testRow = document.createElement("div");
        testRow.className = "row";
        for (let cl = 0; cl < columns; cl++) {
            let testColumn = document.createElement("div");
            testColumn.className = "column";
            for (let cc = 0; cc < cells; cc++) {
                let testCell = document.createElement("div");
                // testCell.textContent = (rr * rows + cl * columns + cc);
                testCell.className = "cell";// + (rr * rows + cl * columns + cc);
                testColumn.appendChild(testCell);
            }
            testRow.appendChild(testColumn);
        }
        container.appendChild(testRow);
    }

    column = container.querySelector(".column");
    row = container.querySelector(".row");
    cell = container.querySelector(".cell");
}

let sectionNamesMap = new Map();
sectionNamesMap.set("addClass", "Add .class");
sectionNamesMap.set("removeClass", "Remove .class");
sectionNamesMap.set("setId", "Set #id");
sectionNamesMap.set("clearId", "Clear #id");
sectionNamesMap.set("setAttributeValue", "Set [attribute=value]");
sectionNamesMap.set("removeAttribute", "Remove [attribute]");
sectionNamesMap.set("focus", "focus()");
sectionNamesMap.set("pseudoElementFocus", "focus() with :focus::pseudo rule")
sectionNamesMap.set("setCssTextSame", "Set .cssText to the same value");
sectionNamesMap.set("setTransformThenGetTransformOrigin", "Set transform and get transformOrigin");

let getClassByContext = (context) => {
    switch (context) {
        case "noAuthorRule": return ""; // this is redundant in this case, but added just for consistency
        case "containerAuthorRule": return "container";
        case "rowAuthorRule": return "row";
        case "columnAuthorRule": return "column";
        case "cellAuthorRule": return "cell";
    }
}

let cleanupAfterTestCase = (context) => {
    let element = getElementByContext(context);
    element.className = getClassByContext(context);
    element.id = "";
    element.removeAttribute("data-attr");
    element.style.transform = "";

    container.id = "container";
    container.className = "";
    container.removeAttribute("data-attr");

    let additionalStyles = document.head.querySelectorAll("style");
    for (var ss = 0; ss < additionalStyles.length; ss++)
        document.head.removeChild(additionalStyles[ss]);

    focusReceiver.focus();

    element.offsetHeight;
    cell.offsetHeight;
}

let runTestCase = function (testAction, testParam, cleanup) {

    let setupAction = setupActionsMap.get(testAction);
    if (setupAction) setupAction(testParam);

    let action = actionsMap.get(testAction);
    if (!action) alert("Test case not found, make sure it's added to actionsMap!");

    let start = performance.now();
    action(testParam);
    let elapsed = performance.now() - start;

    if (cleanup) cleanupAfterTestCase(testParam);

    return elapsed;
}

let getElementByContext = (context) => {
    switch (context) {
        case "noAuthorRule": return document.body; // this is redundant in this case, but added just for consistency
        case "containerAuthorRule": return container;
        case "rowAuthorRule": return row;
        case "columnAuthorRule": return column;
        case "cellAuthorRule": return cell;
    }
}

let addStyleRuleHelper = (cssRule) => {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssRule));
    document.head.appendChild(style);
}

let addFocusPseudoElementRule = (context) => {
    addStyleRuleHelper(":focus::-webkit-input-placeholder { color: black; }");
    document.body.offsetHeight;
}

let addClassBeforeFocus = (context) => {
    addClass(context);
    cell.offsetHeight;
}

let addClass = (cl) => {
    container.classList.add(cl);
    cell.offsetHeight;
}

let removeClass = (cl) => {
    container.classList.remove(cl);
    cell.offsetHeight;
}

let setId = (id) => {
    container.id = id;
    cell.offsetHeight;
}

let clearId = (id) => {
    container.id = "container";
    cell.offsetHeight;
}

let setAttributeValue = (val) => {
    container.setAttribute("data-attr", val);
    cell.offsetHeight;
}

let removeAttribute = (val) => {
    container.removeAttribute("data-attr");
    cell.offsetHeight;
}

let focus = (context) => {
    container.focus();
    cell.offsetHeight;
}

let setCssTextSame = (context) => {
    let element = getElementByContext(context);
    element.style.cssText = element.style.cssText;
    cell.offsetHeight;
}

let setTransformThenGetTransformOrigin = (context) => {
    let element = getElementByContext(context);
    for (var ii = 0; ii < 10; ii++) {
        element.style["transform"] = "matrix3d(" + Math.random() + ",0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
        getComputedStyle(element)["transformOrigin"];
    }
}

let setupActionsMap = new Map();
setupActionsMap.set("removeClass", addClass);
setupActionsMap.set("clearId", setId);
setupActionsMap.set("removeAttribute", setAttributeValue);
setupActionsMap.set("focus", addClassBeforeFocus);
setupActionsMap.set("pseudoElementFocus", addFocusPseudoElementRule);

let actionsMap = new Map();
actionsMap.set("addClass", addClass);
actionsMap.set("removeClass", removeClass);
actionsMap.set("setId", setId);
actionsMap.set("clearId", clearId);
actionsMap.set("setAttributeValue", setAttributeValue);
actionsMap.set("removeAttribute", removeAttribute);
actionsMap.set("focus", focus);
actionsMap.set("pseudoElementFocus", focus); // the actual test case is the same, the difference comes from additional style rule added with setupActions
actionsMap.set("setCssTextSame", setCssTextSame);
actionsMap.set("setTransformThenGetTransformOrigin", setTransformThenGetTransformOrigin);

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

let createManualControls = function (options) {
    sections.forEach(s => {
        let section = document.createElement("section");
        section.id = s;
        let header = document.createElement("h1");
        let sectionTitle = sectionNamesMap.get(s);
        if (!sectionTitle) alert("Unknown section " + s + ", did you add it to sectionNamesMap?");
        header.textContent = sectionTitle;
        section.appendChild(header);
        let generation = generationsMap.get(s);

        buttons.forEach(b => {
            let button = document.createElement("button");
            button.textContent = b;
            button.classList.add("gen" + generation);
            section.appendChild(button);
        });
        manualControlsContainer.appendChild(section);
    });
    if (options && options.addEventListeners) addManualControlsEventListeners();
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

let runAll = function () {
    let generations = getSelectedGenerations();
    let totalElapsed = 0;
    let resultsTable = {};
    latestTestValue.textContent = "Please wait, while we " +
        $("runAll").textContent.toLowerCase();
    latestResultValue.textContent = "(running...)";
    setTimeout(() => {
        sections.forEach(section => {
            let testCaseGeneration = generationsMap.get(section);
            if (generations.indexOf(testCaseGeneration) !== -1) {
                resultsTable[section] = {};
                buttons.forEach(button => {
                    let latestResult = runTestCase(section, button, true);
                    resultsTable[section][button] = latestResult;
                    totalElapsed += latestResult;
                })
            }
        })
        latestTestValue.textContent = "All test cases for selected generation(s)";
        latestResultValue.textContent = totalElapsed.toFixed(2);
        outputRunAllResultsTable(resultsTable);
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
                columnHeader.innerHTML = column;
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
        tableRowTitle.innerHTML = "<h1>" + sectionNamesMap.get(row) + "</h1>";
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

let addManualControlsEventListeners = function () {
    let buttons = document.querySelectorAll("button");
    for (let ii = 0; ii < buttons.length; ii++)
        buttons[ii].addEventListener("click", function (e) {

            if (e.target.id === "runAll") {
                runAll();
                return;
            }

            let testCase = e.target.parentNode.id;
            let testParam = e.target.textContent;

            detailedRunAllResults.innerHTML = "";
            latestTestValue.textContent = sectionNamesMap.get(testCase) + " + " + testParam;
            latestResultValue.textContent = "(running...)";

            setTimeout(() => {
                let latestResult = runTestCase(testCase, testParam, true)
                latestResultValue.textContent = latestResult.toFixed(2);
            }, 50);

        });
};

let checkConsistency = function () {
    let length = sectionNamesMap.size;
    let result = "";

    if (actionsMap.size !== length ||
        generationsMap.size !== length)
        result += "actionsMap or generationsMap size is differnt from sectionNamesMap size.\n" +
            "Did you add new case to all of the maps?";

    sectionNamesMap.forEach((value, key) => {
        if (!actionsMap.get(key)) result += "actionsMap doesn't contain " + key;
        if (!generationsMap.get(key)) result += "generationsMap doesn't contain " + key;
    })

    return result;
}