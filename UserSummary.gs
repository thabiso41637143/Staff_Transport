class userSummary {

  constructor(userId, totNumbDays, amountPaid, outAmount, totNumbUpaidDays, totNumbPaidDays, spreadSheetId, spreadSheetName){
    this.userId = userId;
    this.totNumbDays = totNumbDays;
    this.amountPaid = amountPaid;
    this.outAmount = outAmount;
    this.totNumbUpaidDays = totNumbUpaidDays;
    this.totNumbPaidDays = totNumbPaidDays;

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'UserSummary';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName); 
  }

  getUserSummaryList(){
    return [this.userId, this.totNumbDays, this.amountPaid, this.outAmount
    ,this.totNumbUpaidDays, this.totNumbPaidDays];
  }

  getUserSummaryMap(rowHeading, header){
    rowHeading = rowHeading || 0;
    header = header || this.spreadSheetData.getDataRange().getValues()[rowHeading];
    let userMap = new Map();
    for(let i = 0; i < this.getUserSummaryList().length; i++){
      userMap[header[i]] = this.getUserSummaryList()[i];
    }
    return userMap;
  }

  getUserSummaryJSON(){
    return JSON.stringify(this.getUserSummaryMap());
  }

  updateNumbDays(numbDays, col){
    let resp = '';
    col = col || 2;
    numbDays = numbDays || 0;
    try{
      resp = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseInt(this.totNumbDays + numbDays), 
        'Successfull updated number of days to '+ (parseInt(this.totNumbDays) + parseInt(numbDays)));
        this.totNumbDays = numbDays + this.totNumbDays;
    }catch(e){
      console.error(e);
      console.log('Failed to update number of days.');
      return -1;
    }
    return resp;
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.userId){
        return i;
      }
    }
    return -1;
  }

  updateAmountPaid(amountPaid, col){
    let resp = '';
    col = col || 3;
    amountPaid = amountPaid || 0.00;
    try{
      resp = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseFloat(parseFloat(this.amountPaid) + parseFloat(amountPaid)).toFixed(2),
        'Successfull updated amount paid to R'+ parseFloat(parseFloat(this.amountPaid) + parseFloat(amountPaid)).toFixed(2));
        this.amountPaid =  parseFloat(this.amountPaid) + parseFloat(amountPaid);
    }catch(e){
      console.error(e);
      console.log('Failed to update the amount paid');
      return -1;
    }
    return resp;
  }
  
  updateOustandingAmount(outAmount, col){
    let resp = '';
    col = col || 4;
    outAmount = outAmount || 0.00; 
    try{
      resp = this.updateSpreadSheetCell(this.getRowNumber() + 1, col,
        parseFloat(parseFloat(this.outAmount) + parseFloat(outAmount))
        , 'Successfull updated outstanding amount paid to R' + parseFloat(parseFloat(this.outAmount) + parseFloat(outAmount)));
        this.outAmount = parseFloat(this.outAmount) + parseFloat(outAmount);
    }catch(e){
      console.error(e);
      console.log('Failed to update outstanding amount paid');
      return -1;
    }
    return resp;
  }

  updateTotalPaidDays(daysPaid, col){
    let resp;
    col = col || 6;
    daysPaid = daysPaid || 0;
    try{
      resp = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, 
        parseInt(this.totNumbPaidDays) + parseInt(daysPaid),
        'Successfull updated total number of paid days to '+ (parseInt(this.totNumbPaidDays) + parseInt(daysPaid)));
        this.totNumbPaidDays = parseInt(this.totNumbPaidDays) + parseInt(daysPaid);
    }catch(e){
      console.error(e);
      console.log('Failed to update total number of paid days');
      return -1;
    }
    return resp;
  }

  updateTotalUnpaidDays(daysUnpaid, col){
    let resp = '';
    col = col || 5;
    daysUnpaid = daysUnpaid || 0;
    try{
      resp = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseInt(this.totNumbUpaidDays) + parseInt(daysUnpaid),
        'Successfull updated total number of unpaid days to '+ (parseInt(this.totNumbUpaidDays) + parseInt(daysUnpaid)));
        this.totNumbUpaidDays = parseInt(daysUnpaid) + parseInt(this.totNumbUpaidDays);
    }catch(e){
      console.error(e);
      console.log('Failed to update total number of unpaid days');
      return -1;
    }
    return resp;
  }  
}

/**
 * 
 */
class driverSummary{
  constructor(driverId,	totNumTrip,	totNumbPayments,	comm, spreadSheetId, spreadSheetName){
    this.driverId = driverId;
    this.totNumTrip = totNumTrip;
    this.totNumbPayments = totNumbPayments;
    this.comm = comm;
    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'DriverSummary';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName); 
  }

  getDriverSummaryList(){
    return [this.driverId, this.totNumTrip, this.totNumbPayments, this.comm];
  }

  getDriverSummaryMap(rowHeading, header){
    rowHeading = rowHeading || 0;
    header = header || this.spreadSheetData.getDataRange().getValues()[rowHeading];
    let driverMap = new Map();
    for(let i = 0; i < this.getDriverSummaryList().length; i++){
      driverMap[header[i]] = this.getDriverSummaryList()[i];
    }
    return driverMap;
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.driverId){
        return i;
      }
    }
    return -1;
  }

  updateNumbTrips(numbTrips, col){
    try{
      col = col || 2
      numbTrips = numbTrips || this.totNumTrip + 1;
      let result = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, numbTrips,
      'Update number of trips to ' + numbTrips);
      this.totNumTrip = numbTrips;
      return result;
    }catch(e){
      console.error(['Failed to update number of trips to ' + numbTrips, e]);
      return ['Failed to update number of trips to ' + numbTrips, e];
    }
  }

  updateNumbPayments(numbPayments, col){
    try{
      col = col || 3
      numbPayments = numbPayments || this.totNumbPayments + 1;
      let result = this.updateSpreadSheetCell(this.getRowNumber() + 1, col, numbPayments,
      'Update number of trips to ' + numbPayments);
      this.totNumbPayments = numbPayments;
      return result;
    }catch(e){
      console.error(['Failed to update number of payments to ' + numbPayments, e]);
      return ['Failed to update number of payments to ' + numbPayments, e];
    }
  }
}

/**
 * 
 */
class userFolders{
  constructor(userId, folderId, folderName, docId, docName, comm, spreadSheetId, spreadSheetName){
    this.userId = userId;
    this.folderId = folderId;
    this.folderName = folderName;
    this.docId = docId;
    this.docName = docName;
    this.comments = comm || '';

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'UserFolders';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName); 
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.userId){
        return i;
      }
    }
    return -1;
  }

  getUserFolderList(){
    return [this.userId, this.folderId, this.folderName,
    this.docId, this.docName, this.comments];
  }
  getFolder(){
    
  }
}