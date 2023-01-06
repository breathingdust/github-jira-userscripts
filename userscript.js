// ==UserScript==
// @name         GitHub Jira Buttonizer
// @namespace    http://breathingdust.com/
// @version      0.1
// @description  Adds a button to a Jira issue based on a defined jql search
// @author       Simon Davis
// @match        https://github.com/org/repo/issues/*
// @match        https://github.com/org/repo/pulls/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant          GM_xmlhttpRequest

// ==/UserScript==

(function() {
    'use strict';

    var jiraUsername = ''; // username associated with apitoken
    var jiraPassword = ''; // apitoken
    var jiraHost = ''; // host, probably org.atlassian.net for cloud
    var issueFilter = ''; // jql to reduce results based on team, project etc...
    var issueJiraFieldId = ''; // field to query for the specific GitHub issue.

    var baseUrl = `${jiraHost}rest/api/2/search`;
    var issueUri = window.location.href;

    const searchUrl = new URL(baseUrl);
    searchUrl.searchParams.append('jql', `${issueFilter} and ${issueJiraFieldId}="${issueUri}"`);

    GM_xmlhttpRequest({
        method: "GET",
        url: searchUrl.href,
        headers: {
            "Accept": "application/json"
        },
        responseType: "document",
        onload: function (response) {
            var responseXML = response.responseXML;
            if (!responseXML) {
                try {
                    responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
                }
                catch (err) {}
            }

            var responseJSON = JSON.parse(response.responseText);

            var issues = responseJSON.issues.map(x => x.key);

            var sidebar = document.getElementById('partial-discussion-sidebar');

            var sidebarItem = document.createElement('div');
            sidebarItem.classList.add('discussion-sidebar-item');
            sidebar.prepend(sidebarItem);

            var details = document.createElement('details');
            details.classList.add('details-reset');
            details.classList.add('details-overlay');
            sidebarItem.appendChild(details);

            var summary = document.createElement('summary');
            summary.classList.add('text-bold');
            summary.classList.add('discussion-sidebar-heading');
            summary.innerHTML = 'Jira Links';
            details.appendChild(summary);

            for (var i=0; i<issues.length; i++) {

                var jiraLinkHref = `${jiraHost}browse/${issues[i]}`

                var linkSpan = document.createElement('span');
                linkSpan.style.cssText = 'margin-right:4px';

                sidebarItem.appendChild(linkSpan);

                var jiraLink = document.createElement('a');
                jiraLink.href = jiraLinkHref;
                jiraLink.innerHTML = issues[i];
                linkSpan.appendChild(jiraLink);
            }

            console.log(issues);
        }
    });
})();
