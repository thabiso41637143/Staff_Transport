
/**
 * 
 */
function updateTripChanges() {
  let tripLog = new logTracker();
  tripLog.updateAttTripLog();
}

/**
 * 
 */
function updatePaymentChanges(){
  let tripLog = new logTracker();
  tripLog.updatePaymentLog();
}

/**
 * 
 */
function updateTripPaymentChanges(){
  let tripLog = new logTracker();
  tripLog.updateTripPaymentLog();
}

/**
 * 
 */
function updateNewPassenger(){
  let capLog = new logTracker();
  capLog.updateCapPassLog();
}

/**
 * 
 */
function updatePaidTrips(){
  let paidTrips = new transactionManager();
  if(paidTrips.updatePaidTrips())
    updatePaidTrips();
  else
    console.info('Completed all paid trips');
}

/**
 * This function I run it manual to create a drive in the system
 * Run this function manually.
 */
function updateNewDriver(){
  let driver = new capturePassenger('Admin', 207, 'Tshegofatso Mampana', '(079) 379 4079', 'Driver', '', '', 'tshego.seregobona@gmail.com');
  driver.capturePass('addnewuser');
}

/**
 * create main folder.
 * Run manually when creating main folder.
 */
function createMainFolder(){
  let mainFolder = new folderStructure(
    '1DT_Ap2H4AA6KmySgedhQCEvZ_h_VgjrR', '2024');
  //mainFolder.createFolder();
}

/**
 * Populate the log tracker with all ids and a date to update them
 * Execute once a day using trigger.
 */
function updateDocumentUpdateLog(){
  let userUpdate = new logTracker();
  userUpdate.documentUpdateLog();
}

/**
 * Update user Documents
 * Execute autometically after 10 minutes using triggers
 */
function updateUserDoc(){
  let userid = []
  let data = SpreadsheetApp.openById('1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU')
    .getSheetByName('DocumentUpdateLog').getDataRange().getValues();
  for(let k = 1; k < data.length; k++)
    userid.push(data[k][0]);
  
  for(let i = 0; i < userid.length; i++){
    let userFiles = new logTracker();
    let userFileLog = userFiles.getuserFileLog(userid[i]);
    if(!userFileLog.mainUpdate){
      let userDocs = new updateUserTemplates(userid[i]);
      userDocs.updateUserTripHistory();
      userDocs.updateUserMsgReport();
      console.info(userFiles.spreadSheetUpdateLog(userid[i]));
      return userFiles.removeRow(userid[i], 'DocumentUpdateLog');
    }
    else if(!userFileLog.addDate || !userFileLog.addDate == ''){
      let userDocs = new updateUserTemplates(userid[i]);
      userDocs.updateUserTripHistory();
      userDocs.updateUserMsgReport();
      console.info(userFiles.spreadSheetUpdateLog(userid[i]));
      return userFiles.removeRow(userid[i], 'DocumentUpdateLog');
    }
  }
}

/**
 * create main update.
 * Execute autometically after 10 minutes using triggers
 */
function updateMainLog(){
  let userid = []
  let data = SpreadsheetApp.openById('1y4nNhIe8omKyTMjaB7XrPcL0CqKGMXr2x9W7Y8FLZEU')
    .getSheetByName('SpreadSheetUpdateLog').getDataRange().getValues();
  for(let k = 1; k < data.length; k++)
    userid.push(data[k][0]);
  
  for(let i = 0; i < userid.length; i++){
    let userFiles = new logTracker();
    let userFileLog = userFiles.getuserFileLog(userid[i]);
    if(!userFileLog.mainUpdate){
      console.log('Updating main for user '+ userid[i]);
      let userSheet = new updateUserTemplates(userid[i]);
      userSheet.updateUserHistory();
      console.info(userFileLog.updateMain());
      return userFiles.removeRow(userid[i], 'SpreadSheetUpdateLog');
    }
    else if(!userFileLog.addDate || !userFileLog.addDate == ''){
      console.log('Updating newdate section for user: ' + userid[i]);
      let userSheet = new updateUserTemplates(userid[i]);
      userSheet.updateUserHistory();
      console.info(userFileLog.updateAddedDate());
      return userFiles.removeRow(userid[i], 'SpreadSheetUpdateLog');
    }
    else if(!userFiles.userIsFound(userid[i])){
      return generalFunctions.createUserFileLog();
    }
  }
}

/**
 * To set status to Read for the drivers.
 * Executed once a day using auto triggers.
 */
function updateMsgNotification(){
  let driveList =['TB501', 'TS502', 'SP1001', 'FF1015', 'FF1012', 'FF1009', 'FF1011', 'FF1013', 'FB1002', 'FF1007', 'FF1014'];
  let msg = new messages();
  for(let i = 0; i < driveList.length; i++)
    console.info(msg.getAttSendToMsg_1(driveList[i]));
}
