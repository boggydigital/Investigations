let $ = function (id) { return document.getElementById(id); }

let container = $("container");
let latestResultValue = $("latestResultValue");
let detailedRunAllResults = $("detailedRunAllResults");
let articleTestCases = document.querySelector("article#testCases");
let sections = articleTestCases.getAttribute("data-sections").split(",");
let buttons = articleTestCases.getAttribute("data-buttons").split(",");
let column, row, cell, firstRow;

let createInitialStructure = function (rows, columns, cells) {

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
sectionNamesMap.set("addThenRemoveClass", "Add and remove .class");
sectionNamesMap.set("setId", "Set #id");
sectionNamesMap.set("setThenClearId", "Set and clear #id");
sectionNamesMap.set("setAttributeValue", "Set [attribute=value]");
sectionNamesMap.set("setThenRemoveAttribute", "Set and remove [attribute]");
sectionNamesMap.set("focus", "focus()");
sectionNamesMap.set("pseudoElementFocus", "focus() with :focus::pseudo-element rule")
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

    element.offsetHeight;
}

let runTestCase = function (testAction, testParam, manualRun) {

    let setupAction = setupActionsMap.get(testAction);
    if (setupAction) setupAction(testParam);

    let start = performance.now();
    let action = actionsMap.get(testAction);
    if (!action) alert("Test case not found, make sure it's added to actionsMap!");

    action(testParam);

    let elapsed = performance.now() - start;

    if (manualRun) {
        cleanupAfterTestCase(testParam);
        latestResultValue.textContent = elapsed.toFixed(2);
    }

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

let addClass = (cl) => {
    container.classList.add(cl);
    cell.offsetHeight;
}

let addThenRemoveClass = (cl) => {
    addClass(cl);
    container.classList.remove(cl);
    cell.offsetHeight;
}

let setId = (id) => {
    container.id = id;
    cell.offsetHeight;
}

let setThenClearId = (id) => {
    setId(id);
    container.id = "container";
    cell.offsetHeight;
}

let setAttributeValue = (val) => {
    container.setAttribute("data-attr", val);
    cell.offsetHeight;
}

let setThenRemoveAttribute = (val) => {
    setAttributeValue(val);
    container.removeAttribute("data-attr");
    cell.offsetHeight;
}

let focus = (context) => {
    addClass(context);
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
setupActionsMap.set("pseudoElementFocus", addFocusPseudoElementRule);

let actionsMap = new Map();
actionsMap.set("addClass", addClass);
actionsMap.set("addThenRemoveClass", addThenRemoveClass);
actionsMap.set("setId", setId);
actionsMap.set("setThenClearId", setThenClearId);
actionsMap.set("setAttributeValue", setAttributeValue);
actionsMap.set("setThenRemoveAttribute", setThenRemoveAttribute);
actionsMap.set("focus", focus);
actionsMap.set("pseudoElementFocus", focus); // the actual test case is the same, the difference comes from additional style rule added with setupActions
actionsMap.set("setCssTextSame", setCssTextSame);
actionsMap.set("setTransformThenGetTransformOrigin", setTransformThenGetTransformOrigin);

let generationsMap = new Map();
generationsMap.set("addClass", 1);
generationsMap.set("addThenRemoveClass", 1);
generationsMap.set("setId", 1);
generationsMap.set("setThenClearId", 1);
generationsMap.set("focus", 1);
generationsMap.set("pseudoElementFocus", 1);
generationsMap.set("setAttributeValue", 2);
generationsMap.set("setThenRemoveAttribute", 2);
generationsMap.set("setCssTextSame", 3);
generationsMap.set("setTransformThenGetTransformOrigin", 3);

let createGenerationsControls = function (selected) {
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
        if (selected.indexOf(generation) > -1) generationCheckbox.checked = true;
        generationCheckbox.id = generationId;
        generationCheckbox.setAttribute("data-generation", generation);
        generationLabel.appendChild(generationCheckbox);
        generationsControls.appendChild(generationLabel);
    })
}

let createTestCasesControlPanel = function () {
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
        articleTestCases.appendChild(section);
    });
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
    let addForcedCascade = $("addForcedCascade").checked;
    let totalElapsed = 0;
    let resultsTable = {};
    latestResultValue.textContent = "Please wait, while we " +
        $("runAll").textContent.toLowerCase() +
        "...";
    setTimeout(() => {
        sections.forEach(section => {
            let testCaseGeneration = generationsMap.get(section);
            if (generations.indexOf(testCaseGeneration) !== -1) {
                resultsTable[section] = {};
                buttons.forEach(button => {

                    if (!addForcedCascade &&
                        button == "cellAuthorRule") {
                        // do nothing
                    } else {
                        let latestResult = runTestCase(section, button, true);
                        resultsTable[section][button] = latestResult;
                        totalElapsed += latestResult;
                    }

                })
            }
        })
        latestResultValue.textContent = totalElapsed.toFixed(2);
        outputRunAllResultsTable(resultsTable);
    }, 100);
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

let addButtonsEventListeners = function () {
    let buttons = document.querySelectorAll("button");
    for (let ii = 0; ii < buttons.length; ii++)
        buttons[ii].addEventListener("click", function (e) {
            if (e.target.id === "runAll") {
                runAll();
                return;
            }
            runTestCase(e.target.parentNode.id, e.target.textContent, true);
            detailedRunAllResults.innerHTML = "";
        });
};

let checkBasicConsistency = function () {
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