
/**
 * 
 */
class mainMobileApp{
  constructor(){

  }

  mainMenueReader(option, details){
    if(option.toLowerCase() == 'login'){
      /*
      take a user id and type of user and return true or false to the client.
      */
      console.log(details);
      let log = new transportDatabaseSheet();
      return log.getUsersMap()[details['userid'].toUpperCase()].login(details['userid'].toUpperCase(), details['type']);
    }
    else if(option.toLowerCase() == 'userdetails'){
      return this.getUserDetails(details);
    }
    else if(option.toLowerCase() == 'triphistory'){
      let userTrips = new collectionDatabase();
      return JSON.stringify(userTrips.getPassCapturedTripMap(details['userid']));
    }
    else if(option.toLowerCase() == 'allgroup'){
      return JSON.stringify(this.getUserGroup(details['userid']));
    }
    else if(option.toLowerCase() == 'accounthistory'){
      /*
      This query return the following:
      - return about all amount that was deposited in the account including the date the amount was deposited
      - return the amount that was debited on the account until the current state.
      - it must return a 1 month statement only.
      */
    }
    else if(option.toLowerCase() == 'userprofile'){
      /**
       * This query return the following:
       *  - return the userid
       * - return fullname
       * - return contact numbers
       * - return type
       * - return home location
       * - return work location
       * - return email.
       */
      let user = new transportDatabaseSheet();
      return user.getUsersMap()[details['userid']].getCustDetailJson();
    }
    else if(option.toLowerCase() == 'alluserprofile'){
      return JSON.stringify(this.getAllUserProfile(this.getUserGroup(details['userid'])));
    }
    else if(option.toLowerCase() == 'alert'){
      let msg = new messages();
      return JSON.stringify(msg.getAttSendToMsg_1(details['userid']));
    }
    else if(option.toLowerCase() == 'lastseen'){
      return generalFunctions.formatDateTime();
    }
    else if(option.toLowerCase() == 'driversummary'){
      let driverSum = new transportDatabaseSheet();
      return JSON.stringify(driverSum.getDriverSummary()[details['userid']].getDriverSummaryMap());
    }
    else{

    }
  }

  mainMenueWrite(option, data){
    if(option.toLowerCase() == 'addnewuser'){
      let lock = LockService.getScriptLock();
      try{
        lock.waitLock(300000);
        let results = this.addnewuser(data);
        lock.releaseLock();
        return results;
      }catch(e){
        lock.releaseLock();
        console.log(e);
        return e;
      }
    }
    else if(option.toLowerCase() == 'addnewtrip'){
      let lock = LockService.getScriptLock();
      try{
        lock.waitLock(300000);
        let newTrip = new transactionManager();
        let results = newTrip.updateTrip(data);
         lock.releaseLock();
        return results;
      }catch(e){
         lock.releaseLock();
        console.error(e);
        console.log('An error occured while trying to capture the trip details.');
        return 'An error occured while trying to capture the trip details.';
      }
    }
    else if(option.toLowerCase() == 'addnewpayment'){
      let lock = LockService.getScriptLock();
      lock.waitLock(300000);
      let respond = this.addnewpayment(data);
      lock.releaseLock();
      return respond;
    }
    else if(option.toLowerCase() == 'updateuser'){
      let lock = LockService.getScriptLock();
      try{
        lock.waitLock(300000);
        let resp =  this.updateuser(data);
        lock.releaseLock();
        return resp;
      }catch(e){
        lock.releaseLock();
        console.log(e);
        return e;
      }
    }
    else if(option.toLowerCase() == 'updatetrip'){
      let lock = LockService.getScriptLock();
      try{
        lock.waitLock(300000);
        let dataCol = new collectionDatabase();
        let resp = dataCol.updateCapturedTrip(data['tripid'], data['head'], data['details']);
        lock.releaseLock();
        return resp;
      }catch(e){
        lock.releaseLock();
        console.log(e);
        return e;
      }      
    }
    else if(option.toLowerCase() == 'updatepayment'){
      let lock = LockService.getScriptLock();
        lock.waitLock(300000);
        let dataCol = new collectionDatabase();
        let resp = dataCol.updateCapturedPayment(data['tripid'], data['head'], data['details']);
        lock.releaseLock();
        return resp;
    }
    else if(option.toLowerCase() == 'capturereports'){
      try{
        let repMsg = new messages(214);
        console.log(repMsg.addNewReports(data['userid'], data['report']));
        return 'Successfully captured the report.';
      }catch(e){
        console.log(e);
        return 'Failed to capture the report.';
      }
    }
    else{
      console.log('Unknown menue selection.');
      return 'Unknown menue selection.';
    }
  }

  getId(summaryId, type){
    try{
      let idTr = new idTracker();
      if(type.toLowerCase() == 'userid'){
        return idTr.getSummaryIdMap()[summaryId].createUserId();
      }
      else if(type.toLowerCase() == 'tripid'){
        summaryId = summaryId || 206;
        return idTr.getSummaryIdMap()[summaryId].createTripId();
      }
      else if(type.toLowerCase() == 'paymentid'){
        summaryId = summaryId || 205;
        return idTr.getSummaryIdMap()[summaryId].cretatePaymentId();
      }
      return -1;      
    }catch(e){
      console.error(e);
      return -1;
    }
  }

  addnewuser(data){
    let userId = this.getId(data['userid'], 'userid');
    if(userId != -1){
      let transData = new transportDatabaseSheet();
      let resp =  transData.addNewUser(userId[0].userId.generatedId, data['fullnames'], data['contacts'], data['usertype'],
        data['homelocation'], data['collectionlocation'], data['email'], data['userid']);
      resp += '\n' + transData.addNewAccount(userId[1].accId.generatedId, userId[0].userId.generatedId);
      if(data['userid'] != 207){
        console.log(transData.addNewUserSummary(userId[0].userId.generatedId));
      }
      console.log(userId[0].userId.updateStatus('Used'));
      console.log(userId[1].accId.updateStatus('Used'));
      console.log(resp);
      return resp;
    }
    else{
      console.log('user Id is '+ userId + '\n and details are '+ data);
      return 'Failed to add a new user.';
    }
  }

  /**
   * 
   */
  addnewpayment(data){
      /**
       * - Generate new payment id using the payment id summary.
       */
      let summaryId = 205;
      let payid = this.getId(summaryId, 'paymentid');
      if(payid != -1){
        console.log(data['paylog'].updatePayId(payid.paymentId.generatedId));
        //initializing variables.
        let coldata = new collectionDatabase();
        let trans = new transactionManager();
        /**
         * - Capture new payment details to the spread and return the object of payment.
         * - Update the status of payment to Inprogress.
         * - pay transactions history.
         */
        let payment = coldata.captureNewPayment(payid.paymentId.generatedId, data['passid'], data['date'], 
        data['amount'], data['driverid']);
        console.log(payid.paymentId.updateStatus('Inprogress')); //Update the status to Inprogress.
        console.log(trans.updatePayment(payment));
        console.log('Succesfuly processed payment.');
        return payment;
      }else{
        console.log('Failed to add a new Payment.');
        console.log('Payment Id is '+ payid + '\n and details are '+ data);
        return 'Failed to add a new Payment.';
      }
  }

  updateuser(data){
    let trans = new transportDatabaseSheet();
    if(data['submenue'] == 'group'){
      return trans.updateUserDetailsMap(data['userId'], data['details']);
    }
    else if(data['submenue'] == 'single'){
      return trans.updateUserDetails(data['userid'], data['head'], data['details']);
    }
    else{
      return 'Unknown choice';
    }
  }
  /**
   * This function need to be updated
   */
  getUserDetails(data){
    try{
      let usd = new transportDatabaseSheet();
      let sumData = usd.getUserSummary(data['userid']);
      let useAcc = usd.getAccout(data['userid']);
      let userData = new Map();
      userData['fullname'] = usd.getUser(data['userid']).userFullNames;
      userData['account balance'] = useAcc.accBalance;
      userData['unpaid days'] = sumData.totNumbUpaidDays;
      userData['outstanding balance'] = sumData.outAmount;
      return userData;
    }catch(e){
      console.error(e);
      return 'Failed to generate summary details for user id: ' + data['userid'];
    }
  }

  getAllUserProfile(accgroups){
    let user = new transportDatabaseSheet();
    let userprofiles = new Map();
    let userList = user.getUsersList();
    for(let i = 0; i < userList.length; i++){
      if(userList[i].userType != 'DRIVER' && accgroups[userList[i].groupID] != undefined){
        let sumData = user.getUserSummaryMap()[userList[i].userId];
        let custDet = userList[i].getCustDetails();
        custDet['outstanding balance'] = sumData.outAmount;
        custDet['unpaid days'] = sumData.totNumbUpaidDays;
        userprofiles[userList[i].userId] = custDet;
      }
    }
    return userprofiles;
  }

  getUserGroup(userId){
    let gpMap = new Map();
    let groupAcess = new userAccess();
    let gpIdList = Object.values(groupAcess.getAccessControlMap()[userId].getGroupAcceess());
    for(let i = 0; i < gpIdList.length; i++){
      gpMap[gpIdList[i].groupId ] = gpIdList[i].getGroupDetails();
    }
    return gpMap;
  }
}