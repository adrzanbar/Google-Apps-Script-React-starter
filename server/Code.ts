function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
}

function helloWorld(): string {
  return 'Hello from Google Apps Script!'
}
