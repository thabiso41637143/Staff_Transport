class capturePayment {
  constructor(pymId, userId, pymDate, amount, driverId, spreadSheetId, spreadSheetName){
    this.paymentId = pymId;
    this.userId = userId;
    this.paymentDate = pymDate;
    this.amountPayed = amount;
    this.driverId = driverId;

    this.spreadSheetId = spreadSheetId ||'1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetName = spreadSheetName || 'CapturePayment';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp
      .openById(this.spreadSheetId);
  }

  getRowNumber(spName){
    spName = spName || 'QuerySet';
    return generalFunctions.getQueryData(
      '=arrayformula(QUERY({' + this.spreadSheetName + '!A:A , ROW(' + this.spreadSheetName + '!A:A)}, "Select Col1, Col2 Where Col1 = \'' + this.paymentId + '\'", 0))'
      , this.spreadSheet.getSheetByName(spName), 'A1')[0][1] - 1;
  }

  removePayment(){
    this.spreadSheetData.deleteRow(this.getRowNumber() + 1);
  }
  getCapturePaymentList(){
    return [this.paymentId, this.userId, 
    Utilities.formatDate(new Date(this.paymentDate), 'GMT+0200', 'd MMMM yyyy'), this.amountPayed, this.driverId];
  }

  getCapturePaymentMap(rowHeading, header){
    rowHeading = rowHeading || 0;
    header = header || this.spreadSheetData.getDataRange().getValues()[rowHeading];
    let paymentCaptureMap = new Map();
    for(let i = 0; i < this.getCapturePaymentList().length; i++){
      paymentCaptureMap[header[i].toLowerCase()] = this.getCapturePaymentList()[i];
    }
    return paymentCaptureMap;
  }

  getCapturePaymentSON(){
    return JSON.stringify(this.getCapturePaymentMap());
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateUserId(id, col){
    col = col || 2;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, id.toUpperCase(),
      'Succesfully updated trip user Id to ' + id.toUpperCase());
      this.userId = id.toUpperCase();
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update user id to '+ id.toUpperCase();
    }
  }

  updatePaymentDate(date, col){
    try{
      col = col || 3;
      let resp = 'Failed to add new trip because the date is not valid:'+ date;
      if(new Date(date) != 'Invalid Date'){
        resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, 
          Utilities.formatDate(new Date(date), 'GMT+0200', 'd MMMM yyyy'),
          'Succesfully updated trip date to ' + date);
        this.paymentDate = new Date(date);
      }
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update trip date to '+ date;
    }
  }

  updatePaymentAmount(amt, col){
    col = col || 4;
    try{
      if(!isNaN(amt) && isFinite(amt)){
        let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseFloat(amt).toFixed(2),
        'Succesfully updated trip amount to R' + parseFloat(amt).toFixed(2));
        this.amount = parseFloat(amt);
        return resp;
      }
      console.log('An invalid amount was entered of '+ amt);
      return 'Failed to update the payment amount of ' + amt;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update trip Amount to R'+ amt;
    }
  }
}
