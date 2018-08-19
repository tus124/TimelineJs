//initializeTimeline();
initializeTimelineTest2();


function initializeTimeline() {
    var tl = {};
    tl.events = [];

    var pcx_name = window.parent.Xrm.Page.getAttribute("pcx_name").getValue();
    var caseId = window.parent.Xrm.Page.getAttribute("pcx_casekey").getValue();

    console.log(caseId);

    var phaseLogs = getPhaseLogs(caseId);
    console.log(phaseLogs.length);

    //var fetchXml = "<fetch><entity name='pcx_phaselog'><link-entity name='pcx_casephase' from='pcx_casephaseid' to='pcx_phase'><link-entity name='pcx_case' from='pcx_caseid' to='pcx_case'><filter><condition attribute='pcx_casekey' operator='eq' value='" + caseId + "' /></filter></link-entity></link-entity></entity></fetch>";
    var fetchXml = "<fetch><entity name='pcx_phaselog'><attribute name='pcx_isdatevalue' /><attribute name='pcx_fieldvalue' /><attribute name='pcx_phasename' /><attribute name='pcx_name' /><attribute name='pcx_fieldlabel' /><attribute name='pcx_sdcaseidname' /><link-entity name='pcx_casephase' from='pcx_casephaseid' to='pcx_phase'><attribute name='pcx_name' /><link-entity name='pcx_case' from='pcx_caseid' to='pcx_case'><filter><condition attribute='pcx_casekey' operator='eq' value='" + caseId + "' /></filter></link-entity></link-entity></entity></fetch>";
    var url = window.parent.Xrm.Page.context.getClientUrl() + "/api/data/v8.2/pcx_phaselogs?fetchXml=" + fetchXml;

    console.log(url);

    // Open XMLHttpRequest 
    var events = [];
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            this.onreadystatechange = null;
            if (this.status === 200) {
                var returned = JSON.parse(this.responseText);
                var results = returned.value;

                console.log("results length: " + results.length);

                if (results.length > 0) {
                    for (var i = 0; i < results.length; ++i) {
                       // debugger;
                        var start = results[i]["pcx_begindate"] || new Date();
                        var end = results[i]["pcx_enddate"] || new Date();

                        start = formatDate(start);
                        end = formatDate(end);

                        console.log("start: " + start + "; end: " + end);
                        var caseName = results[i]["pcx_name"] || "";
                        var caseDetails = transformDetailsToHtmlTable(phaseLogs, caseName);
                        console.log(caseDetails);
                        var url = null;

                        tl.events.push(eventGetJson(start, end, caseName, caseDetails, url));
                    }
                    var timeline = new TL.Timeline("timeline", tl, {
                        ga_property_id: "UA-27829802-4",
                        is_embed: true,
                        scale_factor: 1,
                        timenav_position: "top"
                    });
                    //adjust Iframe height;
                    $(window.frameElement, window.parent.document).height($("#timeline").height());
                }
                else {
                    console.log("No results");
                    $("#timeline").html("No results");
                }
            }
            else {
                console.log(this.statusText);
            }
        }
    }
    req.send();
}

function formatDate(d) {
    var newDate = new Date(d);
    return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
}

function getPhaseLogs(caseId) {
    var phaseLog = {};
    phaseLog.entry = [];


    var caseId = window.parent.Xrm.Page.getAttribute("pcx_casekey").getValue();
    console.log("caseId: " + caseId);

    var fetchXml = "<fetch><entity name='pcx_phaselog'><link-entity name='pcx_casephase' from='pcx_casephaseid' to='pcx_phase'><link-entity name='pcx_case' from='pcx_caseid' to='pcx_case'><filter><condition attribute='pcx_casekey' operator='eq' value='" + caseId + "' /></filter></link-entity></link-entity></entity></fetch>";
    var url = window.parent.Xrm.Page.context.getClientUrl() + "/api/data/v8.2/pcx_phaselogs?fetchXml=" + fetchXml;

    console.log(url);

    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onload = function () {

        if (this.readyState === 4) {
            if (this.status === 200) {
                var returned = JSON.parse(this.responseText);
                var results = returned.value;

                console.log("getPhaseLogs results length: " + results.length);

                for (var i = 0; i < results.length; ++i) {
                    var name = results[i]["pcx_casephase1_x002e_pcx_name"];
                    var fieldLabel = results[i]["pcx_fieldlabel"];
                    var fieldValue = results[i]["pcx_fieldvalue"];
                    var isDate = results[i]["pcx_isdatevalue"];

                    console.log("name: " + name + "; fieldLabel: " + fieldLabel + "; fieldValue: " + fieldValue + "; isDate: " + isDate);
                    phaseLog.entry.push(results[i]);
                }
                console.log("phaseLog.entry.length: " + phaseLog.entry.length);

                return phaseLog.entry;
            }
            else {
                console.log(this.statusText);
            }
        }
    }
    req.send();

    return phaseLog.entry;
}

function transformDetailsToHtmlTable(results, caseName) {
    if (results != null) {
        var style = "<style>table, th, td { border:0px solid black; font: caption; color: white;}table td, table td * {vertical-align: top;}</style>";
        var table = "<table><tr>";


        var p = 0;
        var q = 0;
        for (var k = 0; k < 4; ++k) {
            details += "<td><table>";
            var n = results.length;
            for (var j = p + 1; j <= n; ++j) {

                //details += "<tr><td>pcx_fieldlabel</td><td>pcx_fieldvalue</td></tr>";
                //q++;
                //if (j % 3 == 0) {
                //    p = j;
                //    break;
                //}



                var name = results[p]["pcx_casephase1_x002e_pcx_name"];
                var fieldLabel = results[p]["pcx_fieldlabel"];
                var fieldValue = results[p]["pcx_fieldvalue"];
                var isDate = results[p]["pcx_isdatevalue"];

                if (isDate && caseName == name) {
                    table += stringHtmlTableRowColumnConcat(fieldLabel, fieldValue);

                    
                }
                q++;
                if (j % 3 == 0) {
                    p = j;
                    break;
                }
            }
            details += "</table></td>";
            if (n <= 3 || q == n) {
                break;
            }
        }
        table += "</tr></table>";

        return style + table;

        //for (var i = 0; i < results.length; ++i) {
        //    var name = results[i]["pcx_name"];
        //    var fieldLabel = results[i]["pcx_fieldlabel"];
        //    var fieldValue = results[i]["pcx_fieldvalue"];
        //    var isDate = results[i]["pcx_isdatevalue"];

        //    if (isDate && caseName == name) {
        //        table += stringHtmlTableRowColumnConcat(fieldLabel, fieldValue);
        //    }
        //}
        //table += "</tr></table>";

        //return style + table;
    }
    return null;
}

function stringHtmlTableRowColumnConcat(fieldLabel, fieldValue) {


    var results = "<tr>";
    results += "<td>" + fieldLabel + "</td>";
    results += "<td>" + fieldValue + "</td>";
    results += "</tr>";

    return results;
}



function eventGetJson(start, end, name, details, url, caption, credit, thumbnail) {
    var event = {};
    if (start != null) {
        event.start_date = eventGetJsonData(moment(start).startOf('day'));
    }
    if (end != null) {
        event.end_date = eventGetJsonData(moment(end).startOf('day'));
    }
    event.background = {
        "color": "#049e4c",
        "opacity": 50,
        "url": url || null
    };
    event.text = {
        "headline": "<img src='./images/arrow.png'> " + name,
        "text": details,
        
    }
    event.media = {
        "caption": caption || "",
        "credit": credit || "",
        "url": url || "",
        "thumbnail": thumbnail || ""
    }
    return event;
}

function eventGetJsonData(date) {
    return {
        "year": date.format("YYYY"),
        "month": date.format("MM"),
        "day": date.format("DD")
        //"hour": date.format("HH"),
        //"minute": date.format("mm"),
        //"second": "",
        //"millisecond": "",
        //"format": "",
        //"display_text": ""
    }
}


function initializeTimelineTest() {

    var tl = {};
    tl.events = [];

    var m = Math.floor(Math.random() * 10);
    for (var i = 0; i < m; ++i) {
        var start = new Date(2018, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
        var end = new Date(2018, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
        var name = "New Name " + i;
        var details = "<style>table, th, td { border:0px solid black; font: caption; color: white;}table td, table td * {vertical-align: top;} table.border-lb { border-right: 1px solid #cdd0d4; border-spacing: 2px;}  </style>";
        details += "<table><tr>";

        var n = Math.floor(Math.random() * 12);


        var p = 0; 
        var q = 0;
        for (var k = 0; k < 4; ++k) {
            
            details += "<td><table style='padding: 16px'>";
            for (var j = p + 1; j <= n; ++j) {
               
                details += "<tr><td>pcx_fieldlabel</td><td>pcx_fieldvalue</td></tr>";
                q++;
                if (j % 3 == 0) {
                    p = j;
                    break;
                }
                
            }
            details += "</table></td>";
            if (n <= 3 || q == n) {
                break;
            }
        }
        
        details += "</tr></table>";

        var url = null;

        tl.events.push(eventGetJson(start, end, name, details, url));
    }

    var timeline = new TL.Timeline("timeline", tl, {
        ga_property_id: "UA-27829802-4",
        is_embed: true,
        scale_factor: 1,
        timenav_position: "top"
    });
    //adjust Iframe height;
    $(window.frameElement, window.parent.document).height($("#timeline").height());

}


function initializeTimelineTest2() {

    var tl = {};
    tl.events = [];

    var m = Math.floor(Math.random() * 10);
    for (var i = 0; i < m; ++i) {
        var start = new Date(2018, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
        var end = new Date(2018, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
        var name = "New Name " + i;
        var newspaperStyle = ".newspaper { -webkit-column-count: 4; -moz-column-count: 4; column-count: 4; width:100% }";
        var tableStyle = ".table-lb { font: caption; color: white; width:100%}";
        var style = "<style>" + newspaperStyle + tableStyle + "</style>";
        var table = "<div class='newspaper'><table class='table-lb'>";

        var n = Math.floor(Math.random() * 20);
        for (var j = 0; j <= n; ++j) {
            table += "<tr><td>pcx_fieldlabel_" + j + "</td><td>12/12/2012</td></tr>";
        }
   

    table += "</table></div>";

    var url = null;
    var body = style + table;
    console.log(body);
    tl.events.push(eventGetJson(start, end, name, body, url));
    }
    var timeline = new TL.Timeline("timeline", tl, {
        ga_property_id: "UA-27829802-4",
        is_embed: true,
        scale_factor: 1,
        timenav_position: "top"
    });
    //adjust Iframe height;
    $(window.frameElement, window.parent.document).height($("#timeline").height());

}