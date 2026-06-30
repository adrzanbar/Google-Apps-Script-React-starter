function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
}

function hello(): string {
  return 'Hello from Google Apps Script!'
}
