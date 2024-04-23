
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
      '=QUERY(UserFiles!A:H,"Select A, B, C, D, E, F, G, H Where A = \'' + this.userId + '\' and LOWER(G) contains \'' + filePurpose.toLowerCase() + '\'",1)'
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
    //console.info(this.allUserHist.updateAttendanceAlert());

    // console.info(this.allUserHist.updateCapturePayment());

    console.info(this.allUserHist.updateUnpaidTripHistory());

    //console.info(this.allUserHist.updateUnpaidTransactionHistory());
    
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
    this.folder = DriveApp.getFolderById(foldId);
    this.spreadSheetId = spreadSheetId;
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  submitQuery(query, spreadSheetName){
    spreadSheetName = spreadSheetName || 'QueryData';
    this.spreadSheet.getSheetByName(spreadSheetName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spreadSheetName).getRange().getValues();
  }

  updateTransactionIDHistory(spreadSheetName){
    spreadSheetName = spreadSheetName || 'TransactionIDHistory';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);

  }

  updatePaidTransactionHistory(spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaidTransactionHistory';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);

  }

  updateUnpaidTransactionHistory(tripId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'UnpaidTransactionHistory';
    let unpaidTransHist = new transactionHistory(spreadSheetName);
    let transList = unpaidTransHist.getUnpaidTransactionHistory(tripId);
    for(let i = 0; i < transList.length; i++){
       this.spreadSheet.getSheetByName(spreadSheetName).appendRow(transList[i].getTransactionList());
    }
  }

  updateTripsIDHistory(tripId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'TripsIDHistory';
    let tripIdTrac = new idTracker('1ouUI-GCrIPcGPrjlnAvRhgS9p9fZ2BGKOamcfp87rd8');
    this.spreadSheet.getSheetByName(spreadSheetName)
    .appendRow(tripIdTrac.gettripsID(tripId, spreadSheetName, 'QueryData').getTripIdList());
    this.updateUnpaidTransactionHistory(tripId);

  }
  /**
   * Work on it later.
   */
  updatePaidTriphistory(spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaidTriphistory';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);

  }

  updateUnpaidTripHistory(spreadSheetName){
    spreadSheetName = spreadSheetName || 'UnpaidTripHistory';
    let unpaidTrip = new transactionHistory(spreadSheetName);
    let tripList = unpaidTrip.getUnpaidPaidHistory(this.userId);
    for(let i = 0; i < tripList.length; i++){
      this.spreadSheet.getSheetByName(spreadSheetName).appendRow(tripList[i].getCaptureTripsList());
      this.updateTripsIDHistory(tripList[i].tripId);
    }
    return 'Successfully updated the user trip history';
  }

  updateCapturePayment(spreadSheetName){
    spreadSheetName = spreadSheetName || 'CapturePayment';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);
    let pay = new collectionDatabase();
    let userPay = pay.getUserPaymentList(this.userId);
    for(let i = 0; i < userPay.length; i++){
      spreadSheetData.appendRow(userPay[i].getCapturePaymentList());
      this.updatePaymentId(userPay[i].paymentId);
    }
    SpreadsheetApp.flush();
    return 'Successfully updated the user payment.';
  }

  updatePaymentId(payId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'PaymentId';
    let payIdTrac = new idTracker();
    this.spreadSheet.getSheetByName(spreadSheetName)
    .appendRow(payIdTrac.getPaymentID(payId).getPaymentList());
  }

  /**
   * 
   */
  updateMessageId(msgId, spreadSheetName){
    spreadSheetName = spreadSheetName || 'MessageId';
    let msgIdTrac = new idTracker();
    this.spreadSheet.getSheetByName(spreadSheetName)
    .appendRow(msgIdTrac.getMessageId(msgId).getMsgDetailList());
  }

  /**
   * 
   */
  updateAttendanceAlert(spreadSheetName){
    spreadSheetName = spreadSheetName || 'AttendanceAlert';
    let spreadSheetData = this.spreadSheet.getSheetByName(spreadSheetName);
    let msg = new messages();
    let userMsg = msg.getAttMsgList(this.userId, 'Read');
    for(let i = 0; i < userMsg.length; i++){
      spreadSheetData.appendRow(userMsg[i].getMessageList());
      this.updateMessageId(userMsg[i].messageId);
    }
    SpreadsheetApp.flush();
    return 'Successfully updated user alert messages.';
  }

}