
/**
 * 
 */
class generalFunctions{

  static formatDate(d){
    d = d || new Date();
    return Utilities.formatDate(new Date(d), 'GMT+0200', 'd MMMM yyyy');
  }

  static formatDateTime(dt){
    dt = dt || new Date();
    return Utilities.formatDate(new Date(dt), 'GMT+0200', 'd MMMM yyyy, HH:mm:ss');
  }

  static getTempFiles(){
    let templateFile = new Map();
    templateFile['passengertrips'] = {'Id':'1k7qaA5ZRhWgRVsrHx9rhUBJ4R4JN0jiRbsDrrsemDOg', 
    'name':'Trip Payment History', 'type':'Document', 'purpose': 'Trip History'};
    templateFile['messagereport'] = {'Id':'1GRlVCJmDBOsFEtb36y5I85UvGqOZh3aT5Ci-G8qcjQs', 
    'name':'Message Report History', 'type':'Document', 'purpose': 'Message Report'};
    templateFile['userhistory'] = {'Id':'1p8X43VqmOwCVUq90y_oMg9whwocRYB0Fk3t41dwcdRU', 
    'name':'Historic data', 'type':'Spreadsheet', 'purpose': 'User History'};
    return templateFile;
  }

  static getFolderIds(){
    let foderIds = new Map();
    foderIds['user2024'] = '1P8b-HMhCuD0g-K9u868zK6Yf4QER4u3r';
    foderIds['testing'] = '1-AbjQEk1ib_n_BbjrBj5zVtvqIHpFFmA';
    return foderIds;
  }
  
  /**
   * Getting all user Ids from the database tracker
   */
  static getUserId(){
    let userList = new transportDatabaseSheet();
    let us = userList.getUsersList();
    let userIdList = [];
    for(let i = 0; i < us.length; i++){
      userIdList.push(us[i].userId);
    }
    return userIdList;
  }

  /**
   * Create user files logs.
   */
  static createUserFileLog(){
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
    return 'Created a new user for back up.'
  }

  static getWeekDayName(date) {
    date = date || new Date();
    date = new Date(date);
    
    // get the weekday number from the current date
    let dayOfWeek = date.getDay(); 
    let day = '';
    switch (dayOfWeek) {
      case 0:
        day = "Sunday";
        break;
      case 1:
        day = "Monday";
        break;
      case 2:
        day = "Tuesday";
        break;
      case 3:
        day = "Wednesday";
        break;
      case 4:
        day = "Thursday";
        break;
      case 5:
        day = "Friday";
        break;
      case 6:
        day = "Saturday";
    }
    return day;
  }

  static getQueryData(query, spreadSheet, range){
    let lock = LockService.getScriptLock();
    lock.waitLock(300000);
    spreadSheet.getRange(range).setValue(query);
    SpreadsheetApp.flush();
    lock.releaseLock();
    return spreadSheet.getDataRange().getValues();
  }

  static addSpreadSheet(spName, spreadSheet){
    if(!spreadSheet.getSheetByName(spName)) 
      spreadSheet.insertSheet(spName);
    SpreadsheetApp.flush();
  }

  /**
   * 
   */
  static getPosNumber(numb){
    if(numb < 0) return numb * -1;
    return numb;
  }

  /**
   * 
   */
  static getNegNumber(numb){
    if(numb > 0) return numb * -1;
    return numb;
  }

  /**
   * 
   */
  static getNewColumns(){
    let sheetNames = new Map();
    sheetNames['TransactionIDHistory'] = ['Check Update'];
    sheetNames['PaidTransactionHistory'] = ['Check Update'];
    sheetNames['UnpaidTransactionHistory'] = ['Check Update'];
    sheetNames['TripsIDHistory'] = ['Check Update'];
    sheetNames['PaidTriphistory'] = ['Payment Id','Check Update'];
    sheetNames['UnpaidTripHistory'] = ['Check Update']; 
    sheetNames['CapturePayment'] = ['Check Update'];  
    sheetNames['PaymentId'] = ['Check Update'];
    sheetNames['MessageId'] = ['Check Update'];
    sheetNames['AttendanceAlert'] = ['Check Update'];
    return sheetNames;
  }

  /**
   * 
   */
  static getColLetter(numb, spreadSheet){
    return this.getQueryData('=REGEXEXTRACT(ADDRESS(ROW(), '+ numb + '), "[A-Z]+")', spreadSheet, 'A1').pop().pop();
  }

}
