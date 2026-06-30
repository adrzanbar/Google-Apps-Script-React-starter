function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
}

function testGQuery(): object {
  const props = PropertiesService.getScriptProperties()
  const spreadsheetId = props.getProperty('SPREADSHEET_ID')
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID not set in script properties')
  const ss = SpreadsheetApp.openById(spreadsheetId)
  const sheets = ss.getSheets().map(s => s.getName())
  return {
    sheets,
  }
}
