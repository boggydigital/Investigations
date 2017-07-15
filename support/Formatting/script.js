let $ = function(id) { return document.getElementById(id);}

let container = $("container");
let latestResultValue = $("latestResultValue");
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

// createInitialStructure(50, 50, 50);

let sectionNamesMap = new Map();
sectionNamesMap.set("addClass", "Add .class");
sectionNamesMap.set("addThenRemoveClass", "Add and remove .class");
sectionNamesMap.set("setId", "Set #id");
sectionNamesMap.set("setThenClearId", "Set and clear #id");
sectionNamesMap.set("setAttributeValue", "Set [attribute=value]");
sectionNamesMap.set("setThenRemoveAttribute", "Set and remove [attribute]");
sectionNamesMap.set("focus", "focus()");
sectionNamesMap.set("setCssTextSame", "Set .cssText to the same value");

let createControlPanel = function () {
    let articleTestCases = document.querySelector("article#testCases");
    let sections = articleTestCases.getAttribute("data-sections").split(",");
    let buttons = articleTestCases.getAttribute("data-buttons").split(",");

    sections.forEach(s => {
        let section = document.createElement("section");
        section.id = s;
        let header = document.createElement("h1");
        header.textContent = sectionNamesMap.get(s);
        section.appendChild(header);

        buttons.forEach(b => {
            let button = document.createElement("button");
            button.textContent = b;
            section.appendChild(button);
        });
        articleTestCases.appendChild(section);
    });
}

let cleanupAfterTestCase = () => {
    container.className = "";
    container.id = "container";
    container.removeAttribute("data-attr");
    container.offsetHeight;
    var elements = ["noAuthorRule", "containerAuthorRule", "childAuthorRule"];
    elements.forEach(e => {
        var element = container.parentElement;
        while (element) {
            element = container.parentElement.querySelector(e);
            if (element) container.parentElement.removeChild(element);
        }
    })
}

let runTestCase = function (testAction, testParam, manualRun) {
    
    let start = performance.now();
    let action = actionsMap.get(testAction);
    if (!action) alert("Test case not found, make sure it's added to actionsMap!");

    action(testParam);

    let elapsed = performance.now() - start;

    if (manualRun) {
        cleanupAfterTestCase();
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

let insertThenRemoveChild = (context) => {
    insertBefore(context);
    cell.offsetHeight;
    var element = container.parentNode.querySelector(context);
    container.parentNode.removeChild(element);
    cell.offsetHeight;
}

let insertBefore = (context) => {
    let newNode = document.createElement(context);
    container.parentNode.insertBefore(newNode, container);
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

let actionsMap = new Map();
actionsMap.set("addClass", addClass);
actionsMap.set("addThenRemoveClass", addThenRemoveClass);
actionsMap.set("setId", setId);
actionsMap.set("setThenClearId", setThenClearId);
actionsMap.set("setAttributeValue", setAttributeValue);
actionsMap.set("setThenRemoveAttribute", setThenRemoveAttribute);
actionsMap.set("insertThenRemoveChild", insertThenRemoveChild);
actionsMap.set("insertBefore", insertBefore);
actionsMap.set("focus", focus);
actionsMap.set("setCssTextSame", setCssTextSame);

let addButtonsEventListeners = function () {
    let buttons = document.querySelectorAll("button");
    for (let ii = 0; ii < buttons.length; ii++)
        buttons[ii].addEventListener("click", function (e) {
            if (e.target.getAttribute("data-once"))
                e.target.setAttribute("disabled", "disabled");
            runTestCase(e.target.parentNode.id, e.target.textContent, true);
        });
};