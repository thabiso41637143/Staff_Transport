class logTracker {
  constructor(spreadSheetId){
      this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
      this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }
  
  captNewAttTripLog(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc){
    let newTrip = new tripsAttentLog(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc);
    newTrip.captureAttTrip();
  }

  capNewPayTripLog(userId,	passId,	amount, paydate){
    let newPayTrip = new tripPaymentLog(userId,	passId,	amount, paydate, 'Waiting');
    newPayTrip.capturePayTrip();
  }

  capNewCapPassLog(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc, email){
    let newCapPass = new capturePassenger(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc, email);
    newCapPass.captureCapPass();
  }

  getAttTripLog(addId, spName){
    spName = spName || 'TripsAttendanceLog';
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(addId.toString().toUpperCase() == data[i][1].toString().toUpperCase())
      return new tripsAttentLog(data[i][1], data[i][2], data[i][3], data[i][4],
       data[i][5], data[i][6], data[i][7], data[i][8], data[i][0]); 
    }
    return undefined;
  }

  updateAttTripLog(menue, spName){
    spName = spName || 'TripsAttendanceLog';
    menue = menue || 'addnewtrip';
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][8].toString().toLowerCase() == 'waiting'){    
        let trip = new tripsAttentLog(data[i][1], data[i][2], data[i][3], data[i][4],
                        data[i][5], data[i][6], data[i][7], data[i][8], data[i][0]);
        trip.updateSpreadSheetCell(i + 1, 9, 'Inprogress', 'Successfull updated the cell')
        console.log(trip.captureAttTripLog(menue));
        console.log(trip.updateSpreadSheetCell(i + 1, 9, 'Completed', 'Successfull updated trip status to completed'));
        trip.updateStatus('Closed', i + 1);
        break;
      }
    }
  }
  getRowNumber(id, spName, col){
    col = col || 0;
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 0; i < data.length; i++)
      if(id == data[i][col]) return i;
    return -1;
  }

  removeRow(id, spName){
    this.spreadSheet.getSheetByName(spName).deleteRow(
      this.getRowNumber(id, spName, 0)
    );
    return "Successfully removed the id from " + spName;
  }

  spreadSheetUpdateLog(userId, spName){
    spName = spName || 'SpreadSheetUpdateLog';
    this.spreadSheet.getSheetByName(spName).appendRow([userId]);
    return 'Added and id with the following details ' + userId + ' to sheet ' + spName;
  }

  documentUpdateLog(spName){
    spName = spName || 'DocumentUpdateLog';
    let userIdList = generalFunctions.getUserId();
    for(let i = 0; i < userIdList.length; i++)
      this.spreadSheet.getSheetByName(spName).appendRow([userIdList[i]]);
    return 'Updated the ' + spName + ' with new Ids.';
  }
  updatePaymentLog(menue, spName) {
    spName = spName || 'PaymentLog';
    menue = menue || 'addnewpayment';
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][5].toString().toLowerCase() == 'waiting'){   
        let trip = new tripPaymentLog(data[i][1], data[i][2], data[i][3], data[i][4],
                        data[i][5], data[i][0], data[i][6], i, spName);
        try{
          trip.updateSpreadSheetCell(i + 1, 6, 'Inprogress', 'Successfull updated payment status to Inprogress on the transaction log.')
          console.log(trip.captPayment(menue));
          trip.updateSpreadSheetCell(i + 1, 6, 'Completed', 'Successfull updated payment status to completed on the transaction log.');
          trip.updateStatus('Closed');
          break;
        }catch(e){
          console.error(e);
          console.error('Failed to complete the transaction on the tracker log. ');
          console.error(trip.updateSpreadSheetCell(i + 1, 6, 'Failed', 'Failed to complete the payment transaction.'));
          break;
        }
      }
    }
  }

  updateTripPaymentLog(spName) {
    spName = spName || 'TripPaymetUpdateLog';
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][5].toString().toLowerCase() == 'waiting'){   
        let trip = new tripPaymentLog(data[i][1], data[i][2], data[i][3], data[i][4],
            data[i][5], data[i][0], data[i][6], i, spName, data[i][7]);
        try{
          console.info(trip.captTripPayment());
          break;
        }catch(e){
          console.error(e);
          console.error('Failed to complete the transaction on the tracker log. ');
          console.error(trip.updateSpreadSheetCell(i + 1, 6, 'Failed', 'Failed to complete the payment transaction.'));
          break;
        }
      }
    }
  }

  updateCapPassLog(menue, spName){
    spName = spName || 'CapturePassenger';
    menue = menue || 'addnewuser';
    let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][9].toString().toLowerCase() == 'waiting'){
        let capPass = new capturePassenger(data[i][1], data[i][2], data[i][3], data[i][4], 
        data[i][5], data[i][6], data[i][7], data[i][8],data[i][9], i, data[i][0]);
        try{
          console.log(capPass.updateSpreadSheetCell(i + 1, 10, 'Inprogress', 
            'Successfull updated passenger status to Inprogress on the transaction log.'));
          capPass.updateDateStatus();
          console.log(capPass.capturePass(menue));
          console.log(capPass.updateStatus('Closed'));
          return 'Successfully updated the passenger';
        }catch(e){
          console.error([data[i], 'Failed to update the passenger', e]);
          console.error(capPass.updateSpreadSheetCell(i + 1, 10, 'Failed', 
            'Failed to processe this transaction.'));
          capPass.updateDateStatus();
          return 'Failed to update the passenger';
        }
      }
    }
  }

  /**
   * 
   */
  queryData(query, spName){
    spName = spName || 'QueryData';
    this.spreadSheet.getSheetByName(spName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
  }

  userIsFound(userId, spName){
    spName = spName || 'QueryData'
    return this.queryData(
      '=QUERY(UserFileLog!A1:E, "Select A, B, C, D, E where A = \'' + userId + '\'", 1)', spName
    ).length > 1;   
  }

  getuserFileLog(userId, spName){
    spName = spName || 'QueryData'
    let userData = this.queryData(
      '=QUERY(UserFileLog!A1:E, "Select A, B, C, D, E where A = \'' + userId + '\'", 1)', spName
    );
    if(userData.length > 1){
      userData = userData[1];
      return new userFileLog(userData[0], userData[1], userData[2], userData[3], userData[4]);
    }
    return 1;
  }

  addUserFileLog(userId){
    let user = new userFileLog(userId);
    user.createNewUserLog();
  }
}

/**
 * 
 */
class tripsAttentLog{
  constructor(appId, driverId, passId, amt, attTripDate, fromLoc, toLoc, status, captDateTime, spreadSheetName, spreadSheetId){
    this.captDateTime = captDateTime || new Date();
    this.captDateTime = generalFunctions.formatDateTime(this.captDateTime);
    this.appId = appId;
    this.driverId = driverId;
    this.passId = passId;
    this.amount = amt;
    this.attTripDate = generalFunctions.formatDate(attTripDate);
    this.fromLoc = fromLoc;
    this.toLoc = toLoc;
    this.status = status || 'Waiting';
    this.spreadSheetName = spreadSheetName || 'TripsAttendanceLog';
    this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  captureAttTripLog(option){
    let writer = new mainMobileApp();
    return writer.mainMenueWrite(option, 
      JSON.parse(JSON.stringify(
        {'passId': this.passId, 
        'amount': this.amount,
        'driverid': this.driverId,
        'date': this.attTripDate,
        'fromloc': this.fromLoc,
        'toloc': this.toLoc,
        'AppId': this.appId
        }
      )));
  }

  attTripList(){
    return [this.captDateTime, this.appId, this.driverId, this.passId, this.amount,
    this.attTripDate, this.fromLoc, this.toLoc, this.status];
  }

  captureAttTrip(){
    this.spreadSheetData.appendRow(this.attTripList());
    SpreadsheetApp.flush();
  }

  /**
   * 
   */
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

  /**
   * 
   */
  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  removeTripAttLog(rowNumb){
    this.spreadSheetData.deleteRow(rowNumb);
  }

  updateStatus(status, row, col ){
    try{
      col = col || 9;
      row = row || this.getRowNumber() + 1;
      let resuts = this.updateSpreadSheetCell(row, col, status, 
      'trip status updated to '+ status);
      this.updateDateStatus(row);
      this.status = status;
      let hist = new historicData();
      hist.addTripAttHistory(this.appId, this.driverId, this.passId, this.amount,
          this.attTripDate, this.fromLoc, this.toLoc, this.status, this.captDateTime);
      this.removeTripAttLog(row);
      return resuts;
    }catch(e){
      console.error(['An error occured while updating the appId '+ this.appId + ' with status of '+ this.status, e]);
      return ['An error occured while updating the appId '+ this.appId + ' with status of '+ this.status, e];
    }
  }

  updateDateStatus(row, col){
    row = row || this.getRowNumber() + 1;
    col = col ||10;
    return this.updateSpreadSheetCell(row, col, generalFunctions.formatDateTime(), 'Successfully updated Date staus.');
  }
}

/**
 * 
 */
class tripPaymentLog{
  constructor(userId,	passId,	amount, paydate, status, dateCaptured, payId, row, spreadSheetName,statusDate, spreadSheetId){
    this.userId = userId;
    this.passId = passId;
    this.amount = amount;
    this.paydate = generalFunctions.formatDate(paydate);
    this.status = status || 'Waiting';
    this.paymentId = payId || '';
    this.payTriprow = row || 1;
    this.statusDate = statusDate || generalFunctions.formatDateTime();
    this.dateCaptured = dateCaptured || new Date();
    this.dateCaptured = generalFunctions.formatDateTime(this.dateCaptured);
    this.spreadSheetName = spreadSheetName || 'PaymentLog';
    this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  captPayment(option){
    let writer = new mainMobileApp();
    let payLogMap = new Map();
    payLogMap['passid'] = this.passId;
    payLogMap['amount'] = this.amount;
    payLogMap['driverid'] = this.userId;
    payLogMap['date'] = this.paydate;
    payLogMap['paylog'] = this;
    let payment =  writer.mainMenueWrite(option, payLogMap);
    this.paymentId = payment.paymentId;
    return 'Successfully Captured passenger payment of ' + parseFloat(this.amount).toFixed(2);
  }

  captTripPayment(){
    let transPayment = new transactionManager();
    console.info(transPayment.updateTransPayments(this))
    return 'Successfully Captured passenger payment of ' + parseFloat(this.amount).toFixed(2);
  }

  updateAmount(amount){
    this.amount = this.amount - amount;
    return this.updateSpreadSheetCell((this.payTriprow + 1), 4, this.amount, 
      "Updated payment on the log tracker to R"+ this.amount);
  }

  closePayment(){
      let hist = new historicData();
      hist.addPayTripHistory(this.userId, this.passId, this.amount, this.paydate,
          this.status, this.dateCaptured, this.paymentId, this.statusDate, 'TripPaymentHistory');
      this.removePayTripLog(this.payTriprow + 1);
  }

  setStatus(status, msg){
    this.status = status;
    return this.updateSpreadSheetCell(this.payTriprow + 1, 6, status, msg);
  }

  setStatusDate(stDate, msg){
    this.statusDate = stDate;
    return this.updateSpreadSheetCell(this.payTriprow + 1, 8, this.statusDate, msg);
  }
  updateStatus(status, row, col){
    try{
      col = col || 6;
      row = row || this.payTriprow + 1;
      let resuts = this.updateSpreadSheetCell(row, col, status, 
      'payment status updated to '+ status);
      this.updateDateStatus(row);
      this.status = status;
      let spreadSheetName = 'TripPaymetUpdateLog';
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(
        [this.dateCaptured, this.userId, this.passId, this.amount, this.paydate, 'waiting', this.paymentId]
        );
      let hist = new historicData();
      hist.addPayTripHistory(this.userId, this.passId, this.amount, this.paydate,
          this.status, this.dateCaptured);
      this.removePayTripLog(row);
      return resuts;
    }catch(e){
      console.error(['An error occured while updating the payment with status of '+ this.status, e]);
      return ['An error occured while updating the payment with status of '+ this.status, e];
    }
  }

  updateDateStatus(row, col){
    row = row || this.payTriprow + 1;
    col = col || 8;
    return this.updateSpreadSheetCell(row, col, 
    generalFunctions.formatDateTime(), 'Successfully updated Date staus.');
  }

  payTripList(){
    return [this.dateCaptured, this.userId, this.passId, this.amount,
    this.paydate, this.status, this.paymentId];
  }

  capturePayTrip(){
    this.spreadSheetData.appendRow(this.payTripList());
    SpreadsheetApp.flush();
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updatePayId(pId, row, col){
    row = row || this.payTriprow + 1;
    col = col || 7;
    return this.updateSpreadSheetCell(row, col, pId, 
      'Successfully updated the payment id to ' + pId + ', in the Log Tracker.');
  }

  removePayTripLog(rowNumb){
    this.spreadSheetData.deleteRow(rowNumb);
  }
}

class capturePassenger{
  constructor(userId,	groupId,	fullName,	contacts,	
    userType,	homeLoc,	collectionLoc,	email, status, row,dateCap, spreadSheetName, spreadSheetId){
    this.row = row || 1;
    this.status = status || 'Waiting';
    this.collectionLoc = collectionLoc;
    this.homeLoc = homeLoc;
    this.userType = userType;
    this.contacts = contacts;
    this.fullName = fullName;
    this.email = email;
    this.groupId = groupId;
    this.userId = userId;
    this.dateCap = dateCap ||new Date();
    this.dateCap = generalFunctions.formatDateTime(this.dateCap);
    this.spreadSheetName = spreadSheetName || 'CapturePassenger';
    this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  capturePass(option){
    let writer = new mainMobileApp();
    let passDetails = new Map();
    passDetails['userid'] = this.groupId;
    passDetails['fullnames'] = this.fullName;
    passDetails['contacts'] = this.contacts;
    passDetails['usertype'] = this.userType;
    passDetails['homelocation'] = this.homeLoc;
    passDetails['collectionlocation'] = this.collectionLoc;
    passDetails['email'] = this.email;
    return writer.mainMenueWrite(option,passDetails);
    
  }

  capPassList(){
    return [this.dateCap, this.userId, this.groupId, this.fullName, this.contacts,
      this.userType, this.homeLoc, this.collectionLoc, this.email, this.status];
  }
  
  captureCapPass(){
    this.spreadSheetData.appendRow(this.capPassList());
    SpreadsheetApp.flush();
  }

  /**
   * 
   */
  updateSpreadSheetCell(r, c, value, msg){
    console.log([r, c, this.spreadSheetName]);
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  /**
   * 
   */
  updateStatus(status, row, col ){
    try{
      col = col || 10;
      row = row || this.row + 1;
      let resuts = this.updateSpreadSheetCell(row, col, status, 
      'Passenger status updated to '+ status);
      this.updateDateStatus(row);
      this.status = status;
      let hist = new historicData();
      hist.addCapPassHistory(this.userId, this.groupId, this.fullName, this.contacts,
      this.userType, this.homeLoc, this.collectionLoc, this.email, this.status, this.dateCap);
      this.removeCapPassLog(row);
      return resuts;
    }catch(e){
      console.error(['An error occured while updating the passenger with status of '+ this.status, e]);
      return ['An error occured while updating the passenger with status of '+ this.status, e];
    }
  }

  updateDateStatus(row, col){
    row = row || this.row + 1;
    col = col || 11;
    return this.updateSpreadSheetCell(row, col, 
    generalFunctions.formatDateTime(), 'Successfully updated Date staus.');
  }

  removeCapPassLog(rowNumb){
    this.spreadSheetData.deleteRow(rowNumb);
  }
}

/**
 * 
 */
class loginStatus{
  constructor(spreadSheetName, spreadSheetId){

    this.spreadSheetName = spreadSheetName || 'LoginStatus';
    this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }
}

/**
 * 
 */
class userFileLog{
  constructor(userID,	folderCreated,	createdFiles,	mainUpdate, addDate, spreadSheetName, spreadSheetId){
    this.userId = userID;
    this.creatFolder = folderCreated;
    this.fileCreat = createdFiles;
    this.mainUpdate = mainUpdate;
    this.addedDate = addDate;
    this.spreadSheetName = spreadSheetName || 'UserFileLog';
    this.spreadSheetId = spreadSheetId || '1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  queryData(query, spName){
    spName = spName || 'QueryData';
    this.spreadSheet.getSheetByName(spName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
  }

  getRowNumber(col){
    col = col || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][col] == this.userId) return i;
    }
    return -1;
  }

  createNewUserLog(){
    this.spreadSheetData.appendRow([this.userId]);
  }

  updateSheet(msg, data, col, row){
    row = row || this.getRowNumber() + 1;
    this.spreadSheetData.getRange(row, col).setValue(data);
    return msg;
  }

  addCheckBox(col, row, status){
    this.spreadSheetData.getRange(row, col).insertCheckboxes();
    if(status)
      this.spreadSheetData.getRange(row, col).check();
    else
      this.spreadSheetData.getRange(row, col).uncheck();
  }

  createCheckBoxes(col, rowSize){
    col = col || 5;
    rowSize = rowSize || this.spreadSheetData.getDataRange().getValues().length;
    for(let i = 1; i < rowSize; i++)
      this.addCheckBox(col, (i + 1), false);
    return 'Updated the checkboxes.';
  }

  updateFiles(status, col){
    status = status || true;
    col = col || 3;
    this.addCheckBox(col, this.getRowNumber() + 1, status);
    return 'Successfully updated the created file status to ' + status;
  }

  updateFolder(status, col){
    status = status || true;
    col = col || 2;
    this.addCheckBox(col, this.getRowNumber() + 1, status);
    return 'Successfully updated the created folder status to ' + status;
  }

  updateMain(status, col){
    status = status || true;
    col = col || 4;
    this.addCheckBox(col, this.getRowNumber() + 1, status);
    return 'Successfully updated the main update status to ' + status;
  }

  updateAddedDate(status, col){
    status = status || true;
    col = col || 5;
    this.addCheckBox(col, this.getRowNumber() + 1, status);
    return 'Successfully updated the addedDate update status to ' + status;
  }

  addCol(colHeading){
    colHeading = colHeading || generalFunctions.formatDate();
    this.spreadSheetData.getRange(1, 5).setValue(colHeading);
    this.createCheckBoxes();
    SpreadsheetApp.flush();

    return 'Added a new column with the following heading '+ colHeading;
  }
}