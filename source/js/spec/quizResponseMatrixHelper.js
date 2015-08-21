/**
 * @TODO - make this automated. 
 * `quizResponseMatrixFixture.js` is generated manually.
 * Download CSV from Google Spreadsheet.
 * Remove first line of CSV (the headings)
 * copy and paste into http://www.convertcsv.com/csv-to-json.htm
 * Press the CSV to JSON button, copy the output and paste into quizResponseMatrixFixture (surrounded with the AMD scaffolding)
 */
define(['spec/data/quizResponseMatrixFixture'], function (QuizResponseMatrix) {

    function getUserResponseString(response) {
        return replaceEmptyCharWithX(response['FIELD2']) + replaceEmptyCharWithX(response['FIELD3']) + replaceEmptyCharWithX(response['FIELD4']) + replaceEmptyCharWithX(response['FIELD5']) + replaceEmptyCharWithX(response['FIELD6']) + replaceEmptyCharWithX(response['FIELD7']) + replaceEmptyCharWithX(response['FIELD8']) + replaceEmptyCharWithX(response['FIELD9']) + replaceEmptyCharWithX(response['FIELD10']);
    }

    function replaceEmptyCharWithX(character) {
        return character.length === 0 ? 'X' : character;
    }

    var processedExpectedResponses = {},
    	responses,
    	response;

    for (responses in QuizResponseMatrix) {
        response = QuizResponseMatrix[responses];

        if (response['FIELD1'] !== null) {

	        if (!processedExpectedResponses['response' + response['FIELD1']]) {
	        	processedExpectedResponses['response' + response['FIELD1']] = [];
	        }

	        processedExpectedResponses['response' + response['FIELD1']].push(getUserResponseString(response));
	    }
    }

    return processedExpectedResponses;

});