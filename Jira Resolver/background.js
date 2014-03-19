var FIX_VERSION = "fixVersions"
var ASSIGNEE = "assignee"
var QA_LEAD = "customfield_10190"
var FUNCTIONAL_DESCRIPTION = "customfield_10780"
var AUTOMATED_TEST = "customfield_10782"
var NOTES_TO_QA = "customfield_10783"
var FEATURE_TOGGLE = "customfield_17400"
var CHECKIN_CHANGE_TYPE = "customfield_14020"

var TRANSITION_IN_PROGRESS_INTERNAL = "131"
var TRANSITION_IN_PROGRESS_PRODUCTION = "151"
var TRANSITION_CANDIDATE_INTERNAL = "111"
var TRANSITION_CANDIDATE_PROD = "121"
var TRANSITION_STOP_PROGRESS = "51"

var STATUS_IN_PROGRESS_INTERNAL = "10112"
var STATUS_IN_PROGRESS_PRODUCTION = "10114"
var STATUS_OPEN = "1"

var id = window.location.pathname.match("[A-Za-z]+\-[0-9]+")

var uniqueButtonID = 1

var customFieldMetadata = {}
var jiraIssue = {}
var transitions = {}

var prepareForCheckinInternal = function() {
	setModalTitle("Prepare for Checkin to Internal")
	clearFieldsFromModal()
	addFieldToModal(ASSIGNEE)
	addFieldToModal(FIX_VERSION)
	addFieldToModal(QA_LEAD)
	addFieldToModal(FUNCTIONAL_DESCRIPTION)
	addFieldToModal(AUTOMATED_TEST)
	addFieldToModal(NOTES_TO_QA)
	addFieldToModal(FEATURE_TOGGLE)
	
	$('#submitButton').unbind('click')
	$("#submitButton").click(function(event) {
		submitPage(TRANSITION_IN_PROGRESS_INTERNAL)
	})
	
	showModal()
}

var prepareForCheckinProd = function() {
	setModalTitle("Prepare for Checkin to Production")
	clearFieldsFromModal()
	addFieldToModal(ASSIGNEE)
	addFieldToModal(FIX_VERSION)
	addFieldToModal(QA_LEAD)
	addFieldToModal(FUNCTIONAL_DESCRIPTION)
	addFieldToModal(AUTOMATED_TEST)
	addFieldToModal(NOTES_TO_QA)
	
	$('#submitButton').unbind('click')
	$("#submitButton").click(function(event) {
		submitPage(TRANSITION_IN_PROGRESS_PRODUCTION)
	})
	
	showModal()
}

var checkinInternal = function() {
	setModalTitle("Checkin to Internal")
	clearFieldsFromModal()
	addFieldToModal(ASSIGNEE)
	addFieldToModal(FIX_VERSION)
	addFieldToModal(QA_LEAD)
	addFieldToModal(FUNCTIONAL_DESCRIPTION)
	addFieldToModal(AUTOMATED_TEST)
	addFieldToModal(NOTES_TO_QA)
	addFieldToModal(FEATURE_TOGGLE)
	addFieldToModal(CHECKIN_CHANGE_TYPE)
	
	$('#submitButton').unbind('click')
	$("#submitButton").click(function(event) {
		submitPage(TRANSITION_CANDIDATE_INTERNAL)
	})
	
	showModal()
}

var checkinProd = function() {
	setModalTitle("Checkin to Prod")
	clearFieldsFromModal()
	addFieldToModal(ASSIGNEE)
	addFieldToModal(FIX_VERSION)
	addFieldToModal(QA_LEAD)
	addFieldToModal(FUNCTIONAL_DESCRIPTION)
	addFieldToModal(AUTOMATED_TEST)
	addFieldToModal(NOTES_TO_QA)
	addFieldToModal(CHECKIN_CHANGE_TYPE)
	
	$('#submitButton').unbind('click')
	$("#submitButton").click(function(event) {
		submitPage(TRANSITION_CANDIDATE_PROD)
	})
	
	showModal()
}

var transitionFromInternalToProd = function() {
	setModalTitle("Transition to In Progress for Production")
	clearFieldsFromModal()
}

setupModal()

getIssueData(id, function() {
	var statusID = jiraIssue.fields.status.id
	if (statusID == STATUS_OPEN) {
		addButtonToToolbar("Prepare Internal", prepareForCheckinInternal)
		addButtonToToolbar("Prepare Prod", prepareForCheckinProd)
	} else if (statusID == STATUS_IN_PROGRESS_INTERNAL) {
		addButtonToToolbar("Checkin Internal", checkinInternal)
		console.log("In progress internal")
	} else if (statusID == STATUS_IN_PROGRESS_PRODUCTION) {
		addButtonToToolbar("Checkin Prod", checkinProd)
		console.log("In progress production")
	}
})

function addButtonToToolbar(title, callback) {
	var buttonID = "checkinInternal" + uniqueButtonID.toString()
	uniqueButtonID += 1
	$("#opsbar-opsbar-transitions").append('<li class="toolbar-item"><a id="' + buttonID + '" class="toolbar-trigger issueaction-workflow-transition" href="#">' + title + '</a></li>')
	$("#" + buttonID).click(function(event) {
		console.log("Button clicked: " + buttonID)
		callback()
	})
}

function setupModal() {
	$(document.body).append('<div id="jiraResolverModal">\
		<div class="header">\
			<h3 id="modalHeader"></h3>\
		</div>\
		<form action="">\
			<div id="modalFieldsArea">\
			</div>\
			<div class="btn clearfix">\
				<a class="submit" id="submitButton" href="#">Submit</a>\
				<a class="close cancel" id="cancelButton" href="#">Cancel</a>\
			</div>\
		</form>\
	</div>')
	
	$("#jiraResolverModal").easyModal({overlayClose: false})
}

function setModalTitle(title) {
	$("#modalHeader").text(title)
}

function getIssueData(issueID, callback) {
	var activeAJAX = 0
	activeAJAX++
	$.getJSON("https://jira.workday.com/rest/api/2/issue/" + issueID + "/editmeta", function(data) {
		customFieldMetadata = data
		if (--activeAJAX == 0) {
			callback()
		}
	})
	activeAJAX++
	$.getJSON("https://jira.workday.com/rest/api/2/issue/" + issueID, function(data) {
		jiraIssue = data
		console.log(jiraIssue)
		if (--activeAJAX == 0) {
			callback()
		}
	})
	activeAJAX++
	$.getJSON("https://jira.workday.com/rest/api/2/issue/" + issueID + "/transitions", function(data) {
		transitions = data
		console.log(transitions)
		if (--activeAJAX == 0) {
			callback()
		}
	})
}

function showModal() {	
	$("#jiraResolverModal").trigger('openModal')
}

function hideModal() {
	$("#jiraResolverModal").trigger('closeModal')
}

var fields = {}

function clearFieldsFromModal() {
	fields = {}
	$("#modalFieldsArea").empty()
}

// fieldFunction takes form of function(submitData, input) and should append the submitData to that object
function addFieldToModal(fieldID) {
	var fieldMetadata = customFieldMetadata.fields[fieldID]
	if (!fieldMetadata) {
		return;
	}
	console.log(fieldMetadata)

	var name = fieldMetadata.name
	$("#modalFieldsArea").append('<div id="' + fieldID + '"><div id="resolverError"></div><div class="txt">\
		<label for="' + fieldID + '">' + name + ':</label>\
		<input type="text" name="" id="' + fieldID + '">\
	</div></div>')
	var fieldObject = $("div#" + fieldID)
	var input = $("input#" + fieldID)
	
	input.val(getPersistedValueForFieldID(fieldID))
	
	var getInput
	if (fieldMetadata.schema.type == 'user') {
		getInput = function() {
			var submitObject = {}
			submitObject['name'] = input.val()
			return submitObject
		}
	} else if (fieldMetadata.schema.type == 'array') {
		getInput = function() {
			var inputValue = input.val()
			var submitObject = [{'name' : inputValue}]
			return submitObject
		}
	} else {
		getInput = function() {
			return input.val()
		}
	}
	
	var getRawInput = function() {
		return input.val()
	}
	
	fields[fieldID] = {'fieldID' : fieldID, 'fieldObject' : fieldObject, 'submitParamCreator' : getInput, 'rawInput' : getRawInput}
	fieldObject.find("#resolverError").hide()
}

function persistValueForFieldID(value, fieldID) {
	localStorage.setItem(fieldID, value)
}

function getPersistedValueForFieldID(fieldID) {
	var output = localStorage.getItem(fieldID)
	if (output) {
		return output
	} else {
		return ""
	}
}

function displayError(fieldID, error) {
	var targetFieldObject = fields[fieldID]
	var errorDiv = targetFieldObject.fieldObject.find("#resolverError")
	errorDiv.text(error).show()
}

function displayGlobalError(error) {
	// TODO display error
}

function clearErrors() {
	$("#resolverError").text("").hide()
}

function submitPage(transitionID) {
	var submitData = createSubmitData()
	
	$.each(fields, function(key, value) {
		var rawInput = value.rawInput()
		persistValueForFieldID(rawInput, value.fieldID)
		var input = value.submitParamCreator()
		addCustomFieldToSubmitData(submitData, value.fieldID, input)
	})
	console.log("about to submit data: ")
	console.log(submitData)
	
	clearErrors()
	
	postToIssue(id, submitData, function(error) {
		$.each(error.errors, function(key, value) {
			displayError(key, value)
		})
		console.log(error)
	}, function() {
		if (transitionID) {
			transitionIssue(id, transitionID, function(error) { displayGlobalError(error) }, function() { finishAndReload() })
		} else {
			finishAndReload()
		}
	})
}

function finishAndReload() {
	hideModal()
	location.reload(true)
}

function postToIssue(issueID, data, errorCallback, successCallback) {
	$.ajax({
	    url: "https://jira.workday.com/rest/api/2/issue/" + issueID,
	    type: 'PUT',
		data: JSON.stringify(data),
		contentType: "application/json",
	    success: function(result) {
			successCallback()
	    },
		error: function(xhr, status, error) {
			var err = eval("(" + xhr.responseText + ")")
			errorCallback(err)
		}
	})
}

function transitionIssue(issueID, transitionID, errorCallback, successCallback) {
	var data = {"transition" : {"id" : transitionID}}
	$.ajax({
	    url: "https://jira.workday.com/rest/api/2/issue/" + issueID + "/transitions",
	    type: 'POST',
		data: JSON.stringify(data),
		contentType: "application/json",
	    success: function(result) {
			successCallback()
	    },
		error: function(xhr, status, error) {
			var err = eval("(" + xhr.responseText + ")")
			errorCallback(err)
		}
	})
}

function transitionFromPrepareInternalToProd(issueID) {
	transitionIssue(issueID, TRANSITION_STOP_PROGRESS, function(error) {}, function() {
		transitionIssue
	})
}

function transitionFromPrepareProdToInternal(issueID) {
	
}

function createSubmitData() {
	return {"fields": {}}
}

function addCustomFieldToSubmitData(submitData, customFieldID, fieldData) {
	if (!submitData) {
		submitData = createSubmitData()
	}
	submitData.fields[customFieldID] = fieldData	
	return submitData
}

