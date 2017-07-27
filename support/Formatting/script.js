let $ = function (id) { return document.getElementById(id); }

let container = $("container");
let latestResultValue = $("latestResultValue");
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

    element.offsetHeight;
}

let runTestCase = function (testAction, testParam, manualRun) {

    let start = performance.now();
    let action = actionsMap.get(testAction);
    if (!action) alert("Test case not found, make sure it's added to actionsMap!");

    action(testParam);

    let elapsed = performance.now() - start;

    if (manualRun) {
        cleanupAfterTestCase(testParam);
        latestResultValue.textContent = elapsed;
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

// let insertThenRemoveChild = (context) => {
//     insertBefore(context);
//     cell.offsetHeight;
//     var element = container.parentNode.querySelector(context);
//     container.parentNode.removeChild(element);
//     cell.offsetHeight;
// }

// let insertBefore = (context) => {
//     let newNode = document.createElement(context);
//     container.parentNode.insertBefore(newNode, container);
//     cell.offsetHeight;
// }

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

let actionsMap = new Map();
actionsMap.set("addClass", addClass);
actionsMap.set("addThenRemoveClass", addThenRemoveClass);
actionsMap.set("setId", setId);
actionsMap.set("setThenClearId", setThenClearId);
actionsMap.set("setAttributeValue", setAttributeValue);
actionsMap.set("setThenRemoveAttribute", setThenRemoveAttribute);
actionsMap.set("focus", focus);
actionsMap.set("setCssTextSame", setCssTextSame);
actionsMap.set("setTransformThenGetTransformOrigin", setTransformThenGetTransformOrigin);

let generationsMap = new Map();
generationsMap.set("addClass", 1);
generationsMap.set("addThenRemoveClass", 1);
generationsMap.set("setId", 1);
generationsMap.set("setThenClearId", 1);
generationsMap.set("setAttributeValue", 1);
generationsMap.set("setThenRemoveAttribute", 1);
generationsMap.set("focus", 1);
generationsMap.set("setCssTextSame", 2);
generationsMap.set("setTransformThenGetTransformOrigin", 2);

let createGenerationsControls = function (selected) {
    let generations = [];
    let generationsControls = $("generationsControls");
    for (let value of generationsMap.values())
        if (generations.indexOf(value) === -1) generations.push(value);

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
        header.textContent = sectionNamesMap.get(s);
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

    for (let checkbox of generationCheckboxes)
        if (checkbox.checked) generations.push(parseInt(checkbox.getAttribute("data-generation")));

    return generations;
}

let runAll = function () {
    let generations = getSelectedGenerations();
    let totalElapsed = 0;
    let resultsTable = {};
    latestResultValue.textContent = "Please wait running all cases for selected generation(s)...";
    setTimeout(() => {
        for (let section of sections) {
            let testCaseGeneration = generationsMap.get(section);
            if (generations.indexOf(testCaseGeneration) === -1) continue;
            resultsTable[section] = {};
            for (let button of buttons) {
                let latestResult = runTestCase(section, button, true);
                resultsTable[section][button] = latestResult;
                totalElapsed += latestResult;
            }
        }
        latestResultValue.textContent = totalElapsed;
        // TODO: replace this with DOM output
        console.table(resultsTable);
    }, 100);
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
        });
};

let checkBasicConsistency = function () {
    let length = sectionNamesMap.size;
    if (actionsMap.size !== length ||
        generationsMap.size !== length)
        return "actionsMap or generationsMap size is differnt from sectionNamesMap size.\n" +
            "Did you add new case to all of the maps?";

    for (let key of sectionNamesMap.keys()) {
        if (!actionsMap.get(key)) return "actionsMap doesn't contain " + key;
        if (!generationsMap.get(key)) return "generationsMap doesn't contain " + key;
    }
}