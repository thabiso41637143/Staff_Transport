
/**
 * 
 */
function dataReader(option, details) {
  let reader = new mainMobileApp();

  if(option.toLowerCase() == 'login'){
    return reader.mainMenueReader(option, JSON.parse(JSON.stringify({'userid':details.parameter.userid,
        'type': details.parameter.type}
      )
    ));
  }
  else if(option.toLowerCase() == 'userdetails'){
    return JSON.stringify(reader.mainMenueReader(option, JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      )))
    );
  }
  else if(option.toLowerCase() == 'triphistory'){
    return reader.mainMenueReader(option, JSON.parse(JSON.stringify({
            'userid': details.parameter.userid
          }
        )
      )
    );
  }
  else if(option.toLowerCase() == 'accounthistory'){

  }
  else if(option.toLowerCase() == 'userprofile'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      ))
    );
  }
  else if(option.toLowerCase() == 'alluserprofile'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      ))
    );
  }
  else if (option.toLowerCase() == 'allgroup'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      ))
    );
  }
  else if(option.toLowerCase() == 'alert'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      ))
    );
  }
  else if(option.toLowerCase() == 'lastseen'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }
      ))
    );
  }
  else if(option.toLowerCase() == 'driversummary'){
    return reader.mainMenueReader(
        option,
        JSON.parse(JSON.stringify({
          'userid': details.parameter.userid
        }))
    );
  }
}

/**
 * 
 */
function dataWriter(option, details){
  let writer = new mainMobileApp();

  if(option.toLowerCase() == 'addnewtrip'){
    /**
     * requirements:
     * - passId
     * - amount
     * - driverid
     */
    try{
      let access = new userAccess();
      if(access.getAccessControlMap()[details.parameter.driverid].checkAcceess(option.toLowerCase())){
        let amt = parseFloat(details.parameter.amount);
        let newTrip = new logTracker();
        newTrip.captNewAttTripLog(details.parameter.appId, details.parameter.driverid, details.parameter.passId, amt, 
          details.parameter.date, details.parameter.fromloc, details.parameter.toloc);
        return details.parameter.appId;
      }
      return 'You do not have access to capture new payment. Please speak to your admin for assistance to gain access';
    } catch(e){
      console.error(e);
      return 'An error occured while trying to capture the capture new payment data. Please report this problem to the admin.';
    }
  }
  else if(option.toLowerCase() == 'addnewuser'){
    /**
     * Requirements:
     * - userid - summary id
     * - fullnames
     * - contacts
     * - usertype
     * - homelocation
     * - collectionlocation
     * - email - still need to be implemented
     * - implement the syntax to retrive the summary code. sunmit "group"
     */
    try{
      let access = new userAccess();
      if(access.getAccessControlMap()[details.parameter.userId].checkAcceess(option.toLowerCase())){
        let capLog = new logTracker();
        capLog.capNewCapPassLog(details.parameter.userId, details.parameter.groupId, details.parameter.fullnames, 
          details.parameter.contacts, details.parameter.usertype, details.parameter.homelocation, 
          details.parameter.collectionlocation, details.parameter.email);
        return 'Successfully capture the new passenger.';
      }
      return 'You do not have access to add new passenger. Please speak to your admin for assistance to gain access';
    } catch(e){
      console.error(e);
      return 'An error occured while trying to capture the new passenger data. Please report this problem to the admin.';
    }
  }
  else if(option.toLowerCase() == 'addnewpayment'){
    /**
     * requrements:
     * - passid
     * - date
     * - amount
     * - driverid
     */
    try{
      let access = new userAccess();
      if(access.getAccessControlMap()[details.parameter.driverid].checkAcceess(option.toLowerCase())){
        let amt = parseFloat(details.parameter.amount);
        let newPayTrip = new logTracker();
        newPayTrip.capNewPayTripLog(details.parameter.driverid, details.parameter.passId, amt, details.parameter.date);
        return details.parameter.passId;
      }
      return 'You do not have access to add new payment. Please speak to your admin for assistance to gain access';
    } catch(e){
      console.error(e);
      return 'An error occured while trying to capture the new payment data. Please report this problem to the admin.';
    }
  }
  else if(option.toLowerCase() == 'capturereports'){
    return writer.mainMenueWrite(option, 
      JSON.parse(JSON.stringify(
        {'userid': details.parameter.userid, 'report': details.parameter.report}
      )));
  }
  else if(option.toLowerCase() == 'updateuser'){
    /**
     * Requirements:
     * - 
     */
    try{
      let access = new userAccess();
      if(access.getAccessControlMap()[details.parameter.driverId].checkAcceess(option.toLowerCase())){
        return writer.mainMenueWrite(option,JSON.parse(JSON.stringify({'submenue': 'group',
        'userId': details.parameter.passId, 
        'details': {'full names': details.parameter.fullnames, 
        'contact numbers': details.parameter.contacts,
        'email': details.parameter.email
        }}
        )));
      }
      return 'You do not have access to update the details of the user. Please speak to your admin for assistance to gain access';
    } catch(e){
      console.error(e);
      return e;
    }
  }
  else if(option.toLowerCase() == 'updatetrip'){
    /**
     * Requirements:
     * - 
     */
  }
  else{
    return 'Unknown selection.';    
  }
}

/**
 * 
 */
function createUser(userId, fullNames, contacts, userType, homeLocation, collectionLocation) {
  return new userDetails(userId, fullNames, contacts, userType, homeLocation, collectionLocation);
}

/**
 * 
 */
function createUserSummary(userId, totNumbDays, amountPaid, outAmount, totNumbUpaidDays, totNumbPaidDays){
  return new userSummary(userId, totNumbDays, amountPaid, outAmount, totNumbUpaidDays, totNumbPaidDays);
}

/**
 * 
 */
function createTransportDatabase(){
  return new transportDatabaseSheet();
}
