// ==UserScript==
// @name         Jira Board GitHub Buttonizer
// @namespace    http://breathingdust.com/
// @version      0.1
// @description  try to take over the world!
// @author       Simon Davis
// @match        https://hashicorp.atlassian.net/jira/software/c/projects/{project}/boards/{boardid}?*
// @match        https://hashicorp.atlassian.net/jira/software/c/projects/{project}/boards/{boardid}
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';
    var jiraUsername = '';
    var jiraPassword = '';
    var jiraHost = '';
    var issueFieldId = '';
    var jqlIssueFieldId = '';

    var boardId = location.pathname.split('/').pop();

    var baseUrl = `${jiraHost}rest/agile/1.0/board/${boardId}/issue`;

    const searchUrl = new URL(baseUrl);
    searchUrl.searchParams.append('jql',`${issueFieldId}!=null`);

    GM_xmlhttpRequest({
        method: "GET",
        url: searchUrl.href,
        headers: {
            "Accept": "application/json"
        },
        responseType: "document",
        onload: function (response) {

            var responseJSON = JSON.parse(response.responseText);

            if (responseJSON && responseJSON.issues.length > 0) {

                var issues = responseJSON.issues.map(x => ({ key : x.key, issue: x.fields[jqlIssueFieldId]}));

                for (let i = 0; i < issues.length; i++) {
                    var issueCard = document.querySelector(`[data-issue-key=${issues[i].key}]`);
                    var linkTargetDiv = issueCard.querySelector('.ghx-stat-2');

                    var link = document.createElement('a');
                    link.href = issues[i].issue;
                    if (issues[i].issue.includes("github")) {
                       link.innerHTML = '<img src="https://github.githubassets.com/favicons/favicon.png" width="15" height="15"/>'
                    } else {
                        link.innerHTML = '<img src="https://d3ki9tyy5l5ruj.cloudfront.net/obj/df5bcec7e9873dddebdd1328901c287f0f069750/asana-logo-favicon@3x.png" width="16" height="16"/>'
                    }

                    link.setAttribute('onclick', 'event.stopPropagation();');
                    link.setAttribute('target', '_blank');
                    link.style.cssText = 'margin-top:4px';
                    linkTargetDiv.appendChild(link);
                }
            }
        }});
})();
