class historicData {
  constructor(spreadSheetId){
      this.spreadSheetId = spreadSheetId || '1XrMH9XoaiWMG3RfcdUM21wj1T8nGGWs_DsY8rcODaAQ';
      this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  addTripAttHistory(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc, status, captDateTime){
    let attTripHist = new tripsAttendanceHistory(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc, status, captDateTime);
    attTripHist.captureAttTrip();
  }

  addPayTripHistory(userId,	passId,	amount, paydate, status, dateCaptured, payId, stDate, spName){
    spName = spName || 'PaymentHistory';
    let payHist = new tripPaymentHistory(userId,	passId,	amount, paydate, status, dateCaptured, payId, stDate, spName);
    payHist.capturePayment();
  }

  addCapPassHistory(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc,	email, status, row, dateCap){
    let capPassHist = new capPassHistory(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc,	email, status, row, dateCap);
    capPassHist.captureCapPassHist();
  }

}

/**
 * 
 */
class tripsAttendanceHistory{
  constructor(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc, status, captDateTime, spreadSheetName, spreadSheetId){
    this.captDateTime = captDateTime;
    this.appId = appId;
    this.driverId = driverId;
    this.passId = passId;
    this.amount = amt;
    this.attTripDate = attTripDate;
    this.fromLoc = fromLoc;
    this.toLoc = toLoc;
    this.status = status;
    this.spreadSheetName = spreadSheetName || 'TripsAttendanceHistory';
    this.spreadSheetId = spreadSheetId || '1XrMH9XoaiWMG3RfcdUM21wj1T8nGGWs_DsY8rcODaAQ';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  attTripList(){
    return [this.captDateTime, this.appId, this.driverId, this.passId, this.amount,
      this.attTripDate, this.fromLoc, this.toLoc, this.status];
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 1;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.appId){
        return i;
      }
    }
    return -1;
  }

  captureAttTrip(){
    this.spreadSheetData.appendRow(this.attTripList());
    SpreadsheetApp.flush();
  }
}

/**
 * 
 */
class tripPaymentHistory{
  constructor(userId,	passId,	amount, paydate, status, dateCaptured, payId, stDate, spreadSheetName, spreadSheetId){
    this.userId = userId;
    this.passId = passId;
    this.amount = amount;
    this.paydate = paydate;
    this.status = status;
    this.paymentId = payId || '';
    this.statusDate = stDate || generalFunctions.formatDateTime();
    this.dateCaptured =  dateCaptured;
    this.spreadSheetName = spreadSheetName || 'PaymentHistory';
    this.spreadSheetId = spreadSheetId || '1XrMH9XoaiWMG3RfcdUM21wj1T8nGGWs_DsY8rcODaAQ';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  tripPaymentList(){
    return [this.dateCaptured , this.userId, this.passId, 
            this.amount, this.paydate, this.status];
  }

  capturePayment(){
    let tempList = this.tripPaymentList();
    tempList.push(this.paymentId);
    tempList.push(this.statusDate);
    this.spreadSheetData.appendRow(tempList);
    SpreadsheetApp.flush();
  }
}

/**
 * 
 */
class capPassHistory{
  constructor(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc,	email, status, row, dateCap, spreadSheetName, spreadSheetId){
    this.row = row || 1;
    this.email = email;
    this.status = status;
    this.collectionLoc = collectionLoc;
    this.homeLoc = homeLoc;
    this.userType = userType;
    this.contacts = contacts;
    this.fullName = fullName;
    this.groupId = groupId;
    this.userId = userId;
    this.dateCap = dateCap;
    this.spreadSheetName = spreadSheetName || 'CapturePassengerHistory';
    this.spreadSheetId = spreadSheetId || '1XrMH9XoaiWMG3RfcdUM21wj1T8nGGWs_DsY8rcODaAQ';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  capPassHistList(){
    return [generalFunctions.formatDateTime(this.dateCap), this.userId, this.groupId, this.fullName, this.contacts,
      this.userType, this.homeLoc, this.collectionLoc, this.email, this.status];
  }

  captureCapPassHist(){
    this.spreadSheetData.appendRow(this.capPassHistList());
    SpreadsheetApp.flush();
  }
}

/**
 * 
 */
class transactionHistory{
  constructor(spreadsheetName, spreadsheetId){
    this.spreadsheetName = spreadsheetName;
    this.spreadsheetId = spreadsheetId || '1ouUI-GCrIPcGPrjlnAvRhgS9p9fZ2BGKOamcfp87rd8';
    this.spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
  }

  /**
   * 
   */
  addTrans(data, spName){
    this.spreadsheetName = spName;
    this.spreadsheet.getSheetByName(this.spreadsheetName).appendRow(data);
    SpreadsheetApp.flush();
  }

  /**
   * 
   */
  queryData(query, spName){
    let lock = LockService.getScriptLock();
    lock.waitLock(400000);
    this.spreadsheetName = spName;
    this.spreadsheet.getSheetByName(this.spreadsheetName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    lock.releaseLock();

    return this.spreadsheet.getSheetByName(this.spreadsheetName).getDataRange().getValues();
  }

  /**
   * 
   */
  getUserPaidHistory(userId, spName){
    spName = spName || 'QueryData';
    let data = this.queryData(
      '=QUERY(PaidTriphistory!A:K, "select C, D, G, I, J, K Where B = \'' + userId + '\'",1)'
      , spName);
    let fomartData = [];
    for(let i = 1; i < data.length; i++){
      let status = 'Paid';
      if(data[i][2] == 'unpaid') status = 'Not fully paid';
      fomartData.push(
        [generalFunctions.formatDate(data[i][1]), 'R ' + parseFloat(data[i][0]).toFixed(2), 
        status, generalFunctions.formatDate(data[i][3]), 'R ' + parseFloat(data[i][4]).toFixed(2), 
        'R ' + parseFloat(data[i][5]).toFixed(2)]
      );
    }
    return fomartData;
  }

  /**
   * 
   */
}