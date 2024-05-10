
/**
 * 
 */
class updateUserTemplates{
  constructor(userId, spreadSheetName, spreadSheetId){
    this.userId = userId;
    this.payTripHist;
    this.msgDoc;
    this.allUserHist;
    this.userDatabase = new transportDatabaseSheet();
    this.dataColl = new collectionDatabase();
    this.spreadSheetName = spreadSheetName || 'UserFiles';
    this.spreadSheetId = spreadSheetId || '1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
    this.initFiles();
  }

  /**
   * 
   */
  getFile(filePurpose){
    return this.queryFiles(
      '=QUERY(UserFiles!A:H,"Select A, B, C, D, E, F, G, H Where A = \'' + this.userId + '\' and LOWER(G) = \'' + filePurpose.toLowerCase() + '\'",1)'
    )[1];
  }

  /**
   * 
   */
  initFiles(){
    let userData = this.getFile('trip history');
    this.payTripHist = new document(userData[3], userData[1]);

    userData = this.getFile('Message Report');
    this.msgDoc = new document(userData[3], userData[1]);

    userData = this.getFile('User History');
    this.allUserHist = new allUserData(this.userId, userData[3], userData[1]);
  }

  getAllFileUrls(){
    let urlMap = new Map();
    urlMap['tripHistory'] = this.payTripHist.getDocUrl();
    urlMap['messageReport'] = this.msgDoc.getDocUrl();
    urlMap['userHistory'] = this.allUserHist.getUrl();
    return urlMap;
  }
  /**
   * 
   */
  queryFiles(query, spName){
    spName = spName || 'QuerySet';
    this.spreadSheet.getSheetByName(spName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return  this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
  }

  /**
   * 
   */
  updateUserTripHistory(){
    //replacing text from the document
    this.payTripHist.replaceText({'<<PASSENGERNAME>>': this.userDatabase.getUser(this.userId).userFullNames});

    //updating the payment table
    let userPayList = new collectionDatabase();
    userPayList = userPayList.getUserPaymentList(this.userId);
    for(let i = 0; i < userPayList.length; i++){
      console.info(this.payTripHist.
      addToRow([userPayList[i].userId, userPayList[i].paymentDate, 'R ' + userPayList[i].amountPayed.toFixed(2)], 0, 1));
    }
    
    //updating the trip table.
    let userTripList = new transactionHistory()
    userTripList = userTripList.getUserPaidHistory(this.userId);
    for(let i = 0; i < userTripList.length; i++){
      console.info(this.payTripHist.addToRow(userTripList[i], 1, 1));
    }
    this.payTripHist.closeDoc();
  }

  /**
   * 
   */
  updateUserMsgReport(){
    //replacing text from the document
    this.msgDoc.replaceText({'<<passengername>>': this.userDatabase.getUser(this.userId).userFullNames});
    let userMsg = new messages();
    let userMsgList = userMsg.getAttMsgList(this.userId);
    for(let i = 0; i < userMsgList.length; i++){
      console.info(this.msgDoc.insertParag(userMsgList[i].printMsg()));
      console.info(this.msgDoc.drawLine());
    }
    this.msgDoc.closeDoc();
  }

  /**
   * 
   */
  updateUserHistory(){
    console.info(this.allUserHist.updateAttendanceAlert());
    console.info(this.allUserHist.updateCapturePayment());
    console.info(this.allUserHist.updateUnpaidTripHistory());
  }
}

/**
 * 
 */
class document {
  constructor(docId, foldId, spreadSheetName, spreadSheetId){
    this.document = DocumentApp.openById(docId);
    this.folder = DriveApp.getFolderById(foldId);
    this.doc = ABSALUMINUM.getDocument(this.document, this.folder);

    this.spreadSheetName = spreadSheetName || 'CreatedFiles';
    this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);

  }

  /**
   * 
   */
  insertParag(text, pos){
    pos = pos || 2;
    text = text || '';
    return this.doc.addParagraph(pos, text);
  }

  /**
   * 
   */
  drawLine(pos){
    pos = pos || 2;
    return this.doc.addHorizontalLine(pos);
  }

  /**
   * 
   */
  createPDF(){
    console.info(this.doc.createPDFDocument());
    this.spreadSheetData.appendRow(this.doc.getPDFDetailsList());
    return 'Created a PFD file with the following details: \n' + this.doc.getPDFDetailsList();
  }

  replaceText(textReplace){
    this.doc.textReplace = textReplace;
    console.info(this.doc.replaceTextDetails());
  }

  addRow(rowCont, tablePos){
    tablePos = tablePos || 0;
    return this.doc.addRow(rowCont, tablePos);
  }

  addToRow(cont, tablePos, rowNumb){
    rowNumb = rowNumb || 1;
    if(this.doc.addContToRow(cont, tablePos, rowNumb)){
      this.addRow(cont, tablePos);
    }
    return 'Succefully update the table with the following contents: \n' + cont;
  }

  getDocTables(){
    return this.doc.getTableList();
  }

  getDocUrl(){
    return this.doc.getDocUrl();
  }

  setViewAccess(){
    return this.doc.shareViewAccess();
  }

  closeDoc(){
    this.doc.closeDoc();
  }
}

/**
 * 
 */
class allUserData{
  constructor(userId, spreadSheetId, foldId){
    this.userId = userId;
    this.folderId = foldId;
    this.folder = DriveApp.getFolderById(this.folderId);
    this.spreadSheetId = spreadSheetId;
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  /**
   * 
   */
  getUrl(){
    return this.spreadSheet.getUrl();
  }

  /**
   * 
   */
  updateTransactionIDHistory(transId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'TransactionIDHistory';
    try{
      let tId = new idTracker(
          '1ouUI-GCrIPcGPrjlnAvRhgS9p9fZ2BGKOamcfp87rd8'
        );
      let id = tId.getTransID(transId, spreadSheetName, 'QueryData');
      if(id != 1){
        id.tranId.updateStatus('Closed');
        this.spreadSheet.getSheetByName(spreadSheetName)
          .appendRow(id.getTransactionList());
        id.tranId.removeId();
        return 'Successfully updated transaction Id history.';
      }
      return 'Id object was not found.';
    }catch(e){
      console.error(e);
      return "An error occured while updating TransactionIDHistory with the following details: " + e;
    }
  }

  /**
   * 
   */
  updatePaidTransactionHistory(transId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaidTransactionHistory';
    try{
      let transHist = new transactionHistory(spreadSheetName);
      let transHistList = transHist.getPaidTrans(transId);
      for(let i = 0; i < transHistList.length; i++){
        this.spreadSheet.getSheetByName(spreadSheetName)
        .appendRow(transHistList[i].getpaidTranList());
        transHistList[i].accTrans.removeTransact();
      }
      console.info(this.updateTransactionIDHistory(transId));
      return 'Successfully update paid transaction history.';
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update PaidTransactionHistory: ' + e;
    }
  }

  /**
   * 
   */
  updateUnpaidTransactionHistory(tripId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'UnpaidTransactionHistory';
    let unpaidTransHist = new transactionHistory(spreadSheetName);
    let transList = unpaidTransHist.getUnpaidTransactionHistory(tripId);
    for(let i = 0; i < transList.length; i++){
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(transList[i].getTransactionList());
      if(i == 0) console.info(this.updatePaidTransactionHistory(transList[i].transId));
      transList[i].removeTransact();
    }
    return 'Succefully updated the unpaid transaction history.';
  }

  /**
   * 
   */
  updateTripsIDHistory(tripId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'TripsIDHistory';
    let tripIdTrac = new idTracker('1ouUI-GCrIPcGPrjlnAvRhgS9p9fZ2BGKOamcfp87rd8');
    let tId = tripIdTrac.gettripsID(tripId, spreadSheetName, 'QueryData');
    if(tId != 1){
      tId.tripId.updateStatus('Closed');
      this.spreadSheet.getSheetByName(spreadSheetName)
      .appendRow(tId.getTripIdList());
      console.info(this.updatePaidTriphistory(tripId));
      console.info(this.updateUnpaidTransactionHistory(tripId));
      tId.tripId.removeId();
      return 'Successfully updated trip id history.';
    }
    return 'The trip id with ' + tripId + ' is not found';
  }

  /**
   *
   */
  updatePaidTriphistory(tripId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaidTriphistory';
    let paidTrips = new transactionHistory(spreadSheetName);
    let ptripList = paidTrips.getTripById(tripId);
    for(let i = 0; i < ptripList.length; i++){
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(ptripList[i].getPaidTripList());
      console.info(ptripList[i].paidTripHist.removeTrip());
    }
    return 'Successsfully updated paid trip history.';
  }

  /**
   * 
   */
  updateUnpaidTripHistory(spreadSheetName){
    spreadSheetName = spreadSheetName || 'UnpaidTripHistory';
    let unpaidTrip = new transactionHistory(spreadSheetName);
    let tripList = unpaidTrip.getUnpaidPaidHistory(this.userId);
    for(let i = 0; i < tripList.length; i++){
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(tripList[i].getCaptureTripsList());
      console.info(this.updateTripsIDHistory(tripList[i].tripId));
      console.info(tripList[i].removeTrip());
    }
    return 'Successfully updated the user trip history';
  }

  /**
   * 
   */
  updateCapturePayment(spreadSheetName){
    spreadSheetName = spreadSheetName || 'CapturePayment';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);
    let pay = new collectionDatabase();
    let userPay = pay.getUserPaymentList(this.userId);
    for(let i = 0; i < userPay.length; i++){
      spreadSheetData.appendRow(userPay[i].getCapturePaymentList());
      console.info(this.updatePaymentId(userPay[i].paymentId));
      userPay[i].removePayment();
    }
    SpreadsheetApp.flush();
    return 'Successfully updated the user payment.';
  }

  /**
   * 
   */
  updatePaymentId(payId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaymentId';
    try{
      let payIdTrac = new idTracker();
      payIdTrac.getPaymentID(payId).paymentId.updateStatus('Closed');
      this.spreadSheet.getSheetByName(spreadSheetName)
      .appendRow(payIdTrac.getPaymentID(payId).getPaymentList());
      console.info(payIdTrac.getPaymentID(payId).paymentId.removeId());
      return 'Successfully updated payment id.';
    }catch(e){
      console.error(e);
      return 'Failed to update payment with ID: ' + msgId;
    }
  }

  /**
   * 
   */
  updateMessageId(msgId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'MessageId';
    try{
      let msgIdTrac = new idTracker();
      msgIdTrac.getMessageId(msgId).messageId.updateStatus('Closed');
      this.spreadSheet.getSheetByName(spreadSheetName)
      .appendRow(msgIdTrac.getMessageId(msgId).getMsgDetailList());
      console.info(msgIdTrac.getMessageId(msgId).messageId.removeId());
      return 'Successfully updated message id.'
    }catch(e){
      console.error(e);
      return 'Failed to update message with ID: ' + msgId;
    }
  }

  /**
   * 
   */
  updateAttendanceAlert(spreadSheetName){
    spreadSheetName = spreadSheetName || 'AttendanceAlert';
    let msg = new messages();
    let userMsg = msg.getAttMsgList(this.userId, 'Read');
    for(let i = 0; i < userMsg.length; i++){
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(userMsg[i].getMessageList());
      console.info(this.updateMessageId(userMsg[i].messageId));
      userMsg[i].deleteMsg();
    }
    SpreadsheetApp.flush();
    return 'Successfully updated user alert messages.';
  }

  /**
   * 
   */
  getCapturedPayment(payId, spName, spreadSheetName, range){
    spName = spName || 'CapturePayment';
    spreadSheetName = spreadSheetName || 'QuerySheet';
    range = range || 'A1';
    let payment = generalFunctions.getQueryData(
      '=arrayformula(QUERY( {' + spName + '!A:F , ROW(' + spName + '!A:F)},"Select Col1, Col2, Col3, Col4, Col5, Col6, Col7 Where Col1 = \'' + payId + '\'",1))', 
      this.spreadSheet.getSheetByName(spreadSheetName), range
    );
    if(payment.length > 1){
      let data = payment[1];
      return new capturePayment(data[0].toUpperCase(), data[1].toUpperCase(), new Date(data[2]), parseFloat(data[3]), data[4]
      , this.spreadSheetId, spName);
    }
    return undefined;
  }

  /**
   * 
   */
  getPaidTripsByPayId(payId, spName, spreadSheetName, range){
    spName = spName || 'PaidTriphistory';
    spreadSheetName = spreadSheetName || 'QuerySheet';
    generalFunctions.addSpreadSheet(spreadSheetName, this.spreadSheet);
    range = range || 'A1';
    let payTrips = generalFunctions.getQueryData(
      '=arrayformula(QUERY( {' + spName + '!A:L , ROW(' + spName + '!A:L)},"Select Col1, Col2, Col3, Col4, Col5, Col6, Col7, Col8, Col9, Col10, Col11, Col12, Col13 Where Col12 = \'' + payId + '\'",1))', 
      this.spreadSheet.getSheetByName(spreadSheetName), range
    );
    if(payTrips.length > 1){
      return payTrips;
    }
  }

  /**
   * 
   */
  getTotalPaidTrips(payId, spName){
     spName = spName || 'PaidTriphistory';
     let total = 0.00;
    let pTrips = this.getPaidTripsByPayId(payId, spName);
    for(let i = 1; i < pTrips.length; i++){
      total += pTrips[i][9];
    }
    return total;
  }

  /**
   * 
   */
  getRowNumber(id, spreadSheetName, spName){
    spreadSheetName = spreadSheetName || '';
    id = id || '';
    spName = spName || 'QuerySheet';
    generalFunctions.addSpreadSheet(spName, this.spreadSheet);
    return generalFunctions.getQueryData(
      '=arrayformula(QUERY({' + spreadSheetName + '!A:A , ROW(' + spreadSheetName + '!A:A)}, "Select Col1, Col2 Where Col1 = \'' + id + '\'", 0))'
      , this.spreadSheet.getSheetByName(spName), 'A1')[0][1] - 1;
  }
}