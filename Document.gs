
/**
 * 
 */
class updateUserTemplates{
  constructor(userId, spreadSheetName, spreadSheetId){

    this.userId = userId;
    this.userDatabase = new transportDatabaseSheet();
    this.spreadSheetName = spreadSheetName || 'UserFiles';
    this.spreadSheetId = spreadSheetId || '1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
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
    let docData = this.queryFiles(
      '=QUERY(UserFiles!A:H,"Select A, B, C, D, E, F, G, H Where A = \'' + this.userId + '\' and LOWER(G) contains \'trip history\'",1)'
    )[1];
    let userDoc = new document(docData[3], docData[1]);
    let userName =   this.userDatabase.getUser(this.userId);

    //replacing text from the document
    userDoc.replaceText({'<<PASSENGERNAME>>': userName.userFullNames});

    //updating the payment table

    //updating the trip table.

  }

  /**
   * 
   */
  updateUserMsgReport(){

  }

  /**
   * 
   */
  updateUserHistory(){
    
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

  addRow(rowCont){
    return this.doc.addRow(rowCont, 1);
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

