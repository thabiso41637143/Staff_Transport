
/**
 * 
 */
class analytic{
  constructor(spreadSheetId){

    this.spreadSheetId = spreadSheetId ||'1oqWGbOEXJjGcIxulDRM3UapgE6MYiwxHwyD6ZIAhTio';
    this.spreadSheet = SpreadsheetApp
      .openById(this.spreadSheetId)
  }

  capTripHist(dataList, spreadSheetName){
    spreadSheetName = spreadSheetName || 'CapturedTripHistory';
    this.spreadSheet.getSheetByName(spreadSheetName).appendRow(dataList);
  }

  capTransHistory(dataList, spreadSheetName){
    spreadSheetName = spreadSheetName || 'AccountTransactionHistory';
    this.spreadSheet.getSheetByName(spreadSheetName).appendRow(dataList);
  }

  capMessageHistory(dataList, spreadSheetName){
    spreadSheetName = spreadSheetName || 'MessageHistory';
    this.spreadSheet.getSheetByName(spreadSheetName).appendRow(dataList);
  }

}
