function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
}

function ping(): string {
  return 'pong: ' + new Date().toISOString()
}
