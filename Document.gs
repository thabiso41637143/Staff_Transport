
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

  initFiles(){
    let userData = this.getFile('trip history');
    this.payTripHist = new document(userData[3], userData[1]);

    userData = this.getFile('Message Report');
    this.msgDoc = new document(userData[3], userData[1]);

    // userData = this.getFile('User History');
    // this.allUserHist = new document(userData[3], userData[1]);
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
  }

  /**
   * 
   */
  updateUserMsgReport(){

  }

  /**
   * 
   */
  updateUserHistory(rowData, spName){
    
    
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
  constructor(spreadSheetId, foldId){
    this.folder = DriveApp.getFolderById(foldId);
    this.spreadSheetId = spreadSheetId;
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  updateTransactionIDHistory(spreadSheetName){

  }

  updatePaidTransactionHistory(spreadSheetName){

  }

  updateUnpaidTransactionHistory(spreadSheetName){

  }

  updateTripsIDHistory(spreadSheetName){

  }

  updatePaidTriphistory(spreadSheetName){

  }

  updateUnpaidTripHistory(spreadSheetName){

  }

  updateCapturePayment(spreadSheetName){
    
  }

  updatePaymentId(spreadSheetName){

  }

  updateMessageId(spreadSheetName){

  }

  updateAttendanceAlert(spreadSheetName){

  }

}