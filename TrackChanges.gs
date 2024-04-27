
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
 */
function updateNewDriver(){
  let driver = new capturePassenger('Admin', 207, 'Tshegofatso Mampana', '(079) 379 4079', 'Driver', '', '', 'tshego.seregobona@gmail.com');
  driver.capturePass('addnewuser');
}

/**
 * create main folder.
 */
function createMainFolder(){
  let mainFolder = new folderStructure(
    '1DT_Ap2H4AA6KmySgedhQCEvZ_h_VgjrR', '2024');
  //mainFolder.createFolder();
}

/**
 * Create user files logs.
 */
function createUserFileLog(){
  let userIdList = generalFunctions.getUserId();

  //Create folder and files of all usesers
  for(let i = 0; i < userIdList.length; i++){
    let userFiles = new logTracker();
    if(!userFiles.userIsFound(userIdList[i])){
      userFiles.addUserFileLog(userIdList[i]);
      let userFolder = new createUserStructure(userIdList[i], 
      '1P8b-HMhCuD0g-K9u868zK6Yf4QER4u3r');
      console.info(userFolder.createAllUserFiles());
      let userFileLog = userFiles.getuserFileLog(userIdList[i]);
      if(userFileLog != 1){
        userFileLog.updateFiles();
        userFileLog.updateFolder();
      }
    }
  }
}

/**
 * Update user Documents
 */
function updateUserDoc(){

}
