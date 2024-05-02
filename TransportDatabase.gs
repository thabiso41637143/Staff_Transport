
/**
 * 
 */
class transportDatabaseSheet {
  constructor(spreadSheetId){
    this.spreadSheetId = spreadSheetId || '1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  getUsersMap(spreadNames, startRow){
    spreadNames = spreadNames || 'Users';
    startRow = startRow || 1;
    let userMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    
    for(let i = startRow; i < data.length; i++){
      let userId = data[i][0].toString().replaceAll(" ", "");
      let userType = data[i][3].toString().replaceAll(" ", "") ;
      if(!( userId == "" || userType == "" )){
        userMap[userId.toUpperCase()] = new userDetails(userId.toUpperCase(), data[i][1].toUpperCase(), 
        data[i][2], userType.toUpperCase(), data[i][4].toUpperCase(), data[i][5].toUpperCase(), 
        data[i][6], parseInt(data[i][7]), data[i][8]);
      }
    }
    return userMap;
  }

  getGroupMap(spreadNames, startRow){
    spreadNames = spreadNames || 'StaffGroups';
    startRow = startRow || 1;
    let groupMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(parseInt(data[i][0]) != 0){
        groupMap[data[i][0]] = new staffGroup(parseInt(data[i][0]),data[i][1], parseFloat(data[i][2]), data[i][3]);
      }
    }
    return groupMap;
  }
  
  getAccoutMap(spreadNames, startRow){
    spreadNames = spreadNames || 'Account';
    startRow = startRow || 1;
    let accMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      let accId = parseInt(data[i][0]);
      if(!( accId == 0 )){
        accMap[accId] = new account(accId, data[i][1].toUpperCase(), 
        parseFloat(data[i][2]));
      }
    }
    return accMap;
  }

  getUserSummaryMap(spreadNames, startRow){
    spreadNames = spreadNames || 'UserSummary';
    startRow = startRow || 1;
    let userSummaryMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      let userId = data[i][0].toString().replaceAll(" ", "");
      if(userId != ""){
        userSummaryMap[userId] = new userSummary(userId.toUpperCase(), parseInt(data[i][1]), 
        parseFloat(data[i][2]).toFixed(2), parseFloat(data[i][3]).toFixed(2), 
        parseInt(data[i][4]), parseInt(data[i][5]));
      }
    }
    return userSummaryMap;
  }

  getDriverSummary(spreadNames, startRow){
    spreadNames = spreadNames || 'DriverSummary';
    startRow = startRow || 1;

    let driverSummaryMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      let driverId = data[i][0].toString().replaceAll(" ", "");
      if(driverId != ''){
        driverSummaryMap[driverId] = new driverSummary(driverId, parseInt(data[i][1]), parseInt(data[i][2]), data[i][3]);
      }
    }
    return driverSummaryMap;
  }

  getAccoutList(spreadNames, startRow){
    spreadNames = spreadNames || 'Account';
    startRow = startRow || 1;
    let accList = [];
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      let accId = parseInt(data[i][0]);
      if(!( accId == 0 )){
        accList.push(new account(accId, data[i][1].toUpperCase(), 
        parseFloat(data[i][2])));
      }
    }
    return accList;
  }

  getUsersList(spreadNames, startRow){
    spreadNames = spreadNames || 'Users';
    startRow = startRow || 1;
    let userList = [];
    let data = this.spreadSheet
    .getSheetByName(spreadNames).getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      let userId = data[i][0].toString().replaceAll(" ", "");
      let userType = data[i][3].toString().replaceAll(" ", "") ;
      if(!(userId == "" || userType == "" )){
        userList.push(new userDetails(userId.toUpperCase(), data[i][1].toUpperCase(), 
        data[i][2], userType.toUpperCase(), data[i][4].toUpperCase(), data[i][5].toUpperCase(),
        data[i][6], parseInt(data[i][7]), data[i][8]));
      }
    }
    return userList;
  }

  getUserSummaryList(spreadNames, startRow){
    spreadNames = spreadNames || 'UserSummary';
    startRow = startRow || 1;
    let userList = [];
    let data = this.spreadSheet
    .getSheetByName(spreadNames).getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      let userId = data[i][0].toString().replaceAll(" ", "");
      if(userId != ""){
        userList.push(new userSummary(userId.toUpperCase(), parseInt(data[i][1]), 
        parseFloat(data[i][2]).toFixed(2), parseFloat(data[i][3]).toFixed(2), 
        parseInt(data[i][4]), parseInt(data[i][5])));
      }
    }
    return userList;
  }

  addNewAccount(accNumb, userId, spreadSheetName){
    userId = userId.toString().replaceAll(" ", "");
    if(!isNaN(accNumb) && userId != ''){
        spreadSheetName = spreadSheetName || 'Account';
        this.spreadSheet.getSheetByName(spreadSheetName)
          .appendRow([parseInt(accNumb), userId.toUpperCase(), 0.00]);
        SpreadsheetApp.flush();
        console.log('Successfully add the new row with the following details\n'+
            [parseInt(accNumb), userId.toUpperCase(), 0.00]);
        return 'Successfully added a new account for user'
    }
    console.log("Failed to add a new row to the database with the following details\n"+
       [accNumb, userId.toUpperCase(), 0.00]);
      return 'Failed to add a new account details';
  }

  addNewUser(userId, fullNames, contacts, userType, homeLocation, collectionLocation, email, groupId, spreadSheetName){
    userId = userId.toString().replaceAll(" ", "");
    userType = userType.toString().replaceAll(" ","");
    if(!(userId == '' || userType == '')){
        spreadSheetName = spreadSheetName || 'Users';
        this.spreadSheet.getSheetByName(spreadSheetName)
          .appendRow([userId.toUpperCase(), fullNames, contacts, userType, homeLocation, collectionLocation, email, groupId]);
        SpreadsheetApp.flush();
        console.log('Successfully add the new row with the following details\n'+
            [userId, fullNames, contacts, userType, homeLocation, collectionLocation, email, groupId]);
        return 'Successfully added a new user with Id '+ userId;
    }
    console.log("Failed to add a new row to the database with the following details\n"+
        [userId, fullNames, contacts, userType, homeLocation, collectionLocation, email, groupId]);
      return 'Failed to add a new user';
  }

  addNewUserSummary(userId, spreadSheetName){
    userId = userId.toString().replaceAll(" ", "").toUpperCase();
    if(userId != '' && this.getUsersMap()[userId] != undefined && this.getUserSummaryMap()[userId] == undefined){
      spreadSheetName = spreadSheetName || 'UserSummary';
      this.spreadSheet.getSheetByName(spreadSheetName)
        .appendRow([userId, 0, 0, 0, 0, 0]);
      SpreadsheetApp.flush();
      return 'Successfully add the new row to the user summary sheet with the following details\n'+
          [userId, 0, 0, 0, 0, 0];     
    }
    return "Failed to add a new row to the user summary sheet with the following details\n"+
        [userId, 0, 0, 0, 0, 0];
  }

  /**
   * @return a user object from the Database tracker.
   */
  getUser(userId){
    userId = userId.toString().replaceAll(" ", "");
    let user = this.createQuery(
      '=QUERY(Users!A:I,"Select A, B, C, D, E, F, G, H, I Where A = \'' + userId.toUpperCase() + '\'",1)'
    )
    if(user.length > 1){
      user = user[1];
      return new userDetails(user[0].toUpperCase(), user[1].toUpperCase(), 
        user[2], user[3].toUpperCase(), user[4].toUpperCase(), user[5].toUpperCase(),
        user[6], parseInt(user[7]), user[8]);
    }
    return undefined;
  }

    /**
   * @return a user summary object from the Database tracker.
   */
  getUserSummary(userId){
    userId = userId.toString().replaceAll(" ", "");
    let userSumm = this.createQuery(
      '=QUERY( UserSummary!A:G,"Select A, B, C, D, E, F, G Where A = \'' + userId + '\'",1)'
    )
    if(userSumm.length > 1){
      userSumm = userSumm[1];
      return new userSummary(userSumm[0].toUpperCase(), parseInt(userSumm[1]), 
        parseFloat(userSumm[2]).toFixed(2), parseFloat(userSumm[3]).toFixed(2), 
        parseInt(userSumm[4]), parseInt(userSumm[5]));
    }
    return undefined;
  }
  removeUser(userId, spreadNames){
    try{
        userId = userId.toString().replaceAll(" ", "");
        spreadNames = spreadNames || 'Users';
        this.spreadSheet
        .getSheetByName(spreadNames).
        deleteRow((this.getUser(userId.toUpperCase()).getRowNumber()) + 1);
        SpreadsheetApp.flush();
        return 'Successfully delete the user with the following ID '+ userId;
    }catch(e){
      console.error(e);
      return "Failed to delete the record with the following ID: "+ userId;
    }
  }

  removeUserSummary(userId, spreadNames){
    try{
      userId = userId.toString().replaceAll(" ", "");
      spreadNames = spreadNames || 'UserSummary';
      this.spreadSheet
        .getSheetByName(spreadNames).
        deleteRow((this.getUserSummaryMap(spreadNames)[userId.toUpperCase()].getRowNumber()) + 1);
        SpreadsheetApp.flush();
        return 'Successfully delete the user with the following ID '+ userId;

    }catch(e){
      console.error(e);
      return "Failed to delete the record with the following ID: "+ userId;
    }
  }

  updateUserDetailsMap(userId, detailsMap){
    console.log(detailsMap);
    let headList = Object.keys(detailsMap);
    for(let i = 0; i < headList.length; i++){
      console.log(this.updateUserDetails(userId, headList[i], detailsMap[headList[i]]));
    }
    return 'Succefully updated all user details';
  }

  updateUserDetails(id, head, details){
    let resp = '';
    try{
        if(head.toLowerCase() == 'full names'){
          resp = this.getUser(id).setFullName(details);
        }
        else if(head.toLowerCase() == 'contact numbers'){
          resp = this.getUser(id).setContact(details);
        }
        else if(head.toLowerCase() == 'email'){
          resp = this.getUser(id).setEmail(details);
        }
        else if(head.toLowerCase() == 'groupid'){
          resp = this.getUser(id).setGroupId(details);
        }
        else if(head.toLowerCase() == 'home location'){
          resp = this.getUser(id).setHomeLocation(details);
        }
        else if(head.toLowerCase() == 'work location'){
          resp = this.getUser(id).setWorkLocation(details);
        }
        else{
          resp = 'Invalid key: '+ head;
        }
      return resp;
    }catch(e){
      console.error(e);
      console.log("An error occured while updating the user: "+ id);
      console.log(details);
      return "An error occured while updating the user: "+ id;
    }
  }

  updateUserSummary(id, head, data){
    id = id.toUpperCase();
    try{
      let resp = '';
      if(head.toLowerCase() == 'total number of days'){
        resp =  this.getUserSummary(id).updateNumbDays(data);
      }
      else if(head.toLowerCase() == 'amount paid'){
        resp =  this.getUserSummary(id).updateAmountPaid(data);
      }
      else if(head.toLowerCase() == 'outstanding amount'){
        resp =  this.getUserSummary(id).updateOustandingAmount(data);     
      }
      else if(head.toLowerCase() == 'total number of unpaid days'){
        resp =  this.getUserSummary(id).updateTotalUnpaidDays(data);
      }
      else if(head.toLowerCase() == 'total number of paid days'){
        resp =  this.getUserSummary(id).updateTotalPaidDays(data);
      }
      else{
        resp = 'Invalid key: '+ head;
      }
      console.log(resp);
      return resp;
    }catch(e){
      console.error(e);
      console.log("An error occured while updating the user: "+ id);
      console.log(data);
      return -1;
    }
  }

  createQuery(query, spName){
    spName = spName || 'QuerySet';
    this.spreadSheet.getSheetByName(spName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
  }
  getAccout(userId, spName){
    spName = spName || 'QuerySet';
    let row = 1;
    if(this.createQuery(
      '=QUERY(Account!A:D,"Select A, B, C, D Where B = \'' + userId.toString().toUpperCase() + '\'",1)'
    ).length > 1){
      let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
      return new account(data[row][0], data[row][1].toUpperCase(), 
        parseFloat(data[row][2]))
    }
    return -1;
  }

  updateAcountBalance(type, id, balance){
    try{
        if(type.toLowerCase() == 'userid'){
          return this.getAccout(id).updateAccBalance(balance);
        }
        else if(type.toLowerCase() == 'accountid'){
          return this.getAccoutMap()[id].updateAccBalance(balance);
        }
          return 'Invalid selection';
    }catch(e){
      console.error(e);
      return 'Failed to update balance.'
    }
  }
}
