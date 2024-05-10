class account {
  constructor(accNumb, userId, accBalance, spreadSheetId, spreadSheetName){
    this.accountNumb = accNumb;
    this.userId = userId;
    this.accBalance = accBalance;

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'Account';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId)
  }

  getRowNumber(spName){
    spName = spName || 'QuerySet';
    return generalFunctions.getQueryData(
      '=arrayformula(QUERY({' + this.spreadSheetName + '!A:A , ROW(' + this.spreadSheetName + '!A:A)}, "Select Col1, Col2 Where Col1 = ' + this.accountNumb + '", 0))'
      , this.spreadSheet.getSheetByName(spName), 'A1')[0][1] - 1;
  }

  getAccountList(){
    return [this.accountNumb, this.userId, this.accBalance];
  }

  getAccountMap(rowHeading){
    rowHeading = rowHeading || 0;
    let accMap = new Map();
    let headingData = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    for(let i = 0; i < this.getAccountList().length; i++){
      accMap[headingData[i]] = this.getAccountList()[i];
    }
    return accMap;
  }

  getAccountJSON(){
    return JSON.stringify(this.getAccountMap());
  }

  updateAccBalance(amount, col){
    try{
      col = col || 3;
      this.spreadSheetData.getRange(this.getRowNumber() + 1, col).setValue(parseFloat(amount + this.accBalance).toFixed(2));
      SpreadsheetApp.flush();
      this.accBalance = amount + this.accBalance;
      return 'Successfull updated the account balance to R'+ parseFloat(amount).toFixed(2);
    }catch(e){
      console.error(e);
      return 'failed to updated the account balance to R'+ parseFloat(amount).toFixed(2);
    }
  }
}
