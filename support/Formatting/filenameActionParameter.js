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
