"use strict";

// automated.js defines minimal amount of functions required to run automed tests
// it should not have external dependencies as it represents a minimal amount of
// code to run any (and all) benchmark case 

let $ = function(id) { return document.getElementById(id); }

let container = $("container");
let column, row, cell;

let setupActionsMap = new Map();
let actionsMap = new Map();

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
                testCell.className = "cell";
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

let getClassByContext = (context) => {
    switch (context) {
        case "noAuthorRule": return ""; // this is redundant in this case, but added just for consistency
        case "containerAuthorRule": return "container";
        case "rowAuthorRule": return "row";
        case "columnAuthorRule": return "column";
        case "cellAuthorRule": return "cell";
    }
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

let runTestCase = function (options) {

    if (!options) NaN;

    let setupAction = setupActionsMap.get(options.action);
    if (setupAction) setupAction(options.parameter);

    let action = actionsMap.get(options.action);
    if (!action) alert("Test case not found, make sure it's added to actionsMap!");

    let start = performance.now();
    action(options.parameter);
    let elapsed = performance.now() - start;

    if (options.cleanup) cleanupAfterTestCase(options.parameter);

    return elapsed;
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

let addThenRemoveClass = (cl) => {
    addClass(cl);
    removeClass(cl);
}

let setId = (id) => {
    container.id = id;
    cell.offsetHeight;
}

let clearId = (id) => {
    container.id = "container";
    cell.offsetHeight;
}


let setThenClearId = (id) => {
    setId(id);
    clearId(id);
}

let setAttributeValue = (val) => {
    container.setAttribute("data-attr", val);
    cell.offsetHeight;
}

let removeAttribute = (val) => {
    container.removeAttribute("data-attr");
    cell.offsetHeight;
}


let setThenRemoveAttribute = (val) => {
    setAttributeValue(val);
    removeAttribute(val);
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

setupActionsMap.set("removeClass", addClass);
setupActionsMap.set("clearId", setId);
setupActionsMap.set("removeAttribute", setAttributeValue);
setupActionsMap.set("focus", addClassBeforeFocus);
setupActionsMap.set("pseudoElementFocus", addFocusPseudoElementRule);

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

let extractActionParameterFromFilename = function (uri) {
    try {
        // Filename determines action and parameter.
        // Format:  "..._<action>-<parameter>.html"
        // Example: extractActionParameterFromFilename("..._focus-cellAuthorRule.html") will return 
        // { "action": "focus",
        //   "parameter": "cellAuthorRule" }
        var strFilename = uri.substr(uri.lastIndexOf("/") + 1);

        var matchResults = strFilename.match(/_(.*)-(.*).html/i);
        if (matchResults == null) throw "Failed to parse location.pathname:" + uri;

        return {
            "action": matchResults[1],
            "parameter": matchResults[2]
        }

    }
    catch (e) {
        document.body.innerText = "ERROR: " + e;
    }
}