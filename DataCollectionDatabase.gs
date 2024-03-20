class collectionDatabase {
  constructor(spreadSheetId){
      this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
      this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  addNewTrip(tripId, userId, amount, date, fromLoc, toLoc, status, driveId, spreadNames){
    try{
      status = status || 'Unpaid';
      spreadNames = spreadNames || 'CaptureTrip';
      amount = parseFloat(amount).toFixed(2);
      let strDate = Utilities.formatDate(new Date(date), 'GMT+0200', 'd MMMM yyyy');
      userId = userId.toUpperCase();
      if(new Date(date) != 'Invalid Date'){
          this.spreadSheet.getSheetByName(spreadNames)
            .appendRow([tripId, userId, amount, strDate, fromLoc, toLoc, status, driveId]);
          SpreadsheetApp.flush();
          return "A new row is added with the following details: "
            + [tripId, userId, amount, strDate, fromLoc, toLoc, status, driveId];
      }
       return 'Failed to add new trip because the date is not valid:' + strDate;
    }catch(e){
      console.error(e);
      return 'Failed to add new trip.'
    }
  }

  addNewTransaction(userId, transAmount, tripId, transType, summaryId){
    try{
      summaryId = summaryId || 209;
      let transDat = new transportDatabaseSheet();
      let acc = transDat.getAccout(userId).accountNumb
      let newId = new idTracker();
      console.log(this.recordPaymentTransaction(
        newId.getSummaryIdMap()[summaryId].createTransactionId(acc).tranId.generatedId,
        transType, new Date(), transAmount, tripId
      ));
      return 'successfully updated the transaction.';
    }catch(e){
      console.error(e);
      console.log('failed to update the transaction for user with the following details. '
      + [userId, transAmount, transType]);
      return -1;
    }

  }

  captureNewPayment(pymId, userId, pymDate, amount,driveId, spreadNames){
    try{
      spreadNames = spreadNames || 'CapturePayment';
      if(new Date(pymDate) != 'Invalid Date' && !isNaN(parseFloat(amount)) && isFinite(amount)){
        this.spreadSheet.getSheetByName(spreadNames)
          .appendRow([pymId.toUpperCase(), userId.toUpperCase(),
          Utilities.formatDate(new Date(pymDate), 'GMT+0200', 'd MMMM yyyy'),
          parseFloat(amount).toFixed(2), driveId]);
        SpreadsheetApp.flush();
        console.log('Successfully captured a new payment with the following details: '+
          [pymId.toUpperCase(), userId.toUpperCase(),
            Utilities.formatDate(new Date(pymDate), 'GMT+0200', 'd MMMM yyyy'),
            parseFloat(amount).toFixed(2), driveId]);
        return new capturePayment(pymId.toUpperCase(), userId.toUpperCase(),
            Utilities.formatDate(new Date(pymDate), 'GMT+0200', 'd MMMM yyyy'),
            parseFloat(amount).toFixed(2), driveId)
      }
      console.error('Failed to create a new payment, because of invalid date of ' + pymDate +
      '\nOr because of Invalid Amount of R'+ amount);
      return undefined;
    }catch(e){
      console.error(e);
      console.log('Failed to capture the new payment.');
      return undefined;
    }
  }

  recordPaymentTransaction(transId, transType, transDate, transAmount, tripId, spreadNames){
    try{
      spreadNames = spreadNames || 'AccountTransaction';
      let idChecks = new idTracker();

      if((idChecks.getTransID(transId) != undefined)
        && !isNaN(transAmount) && new Date(transDate) != 'Invalid Date'){

          let accNum = idChecks.getTransID(transId).accNumber;
          let acc = new transportDatabaseSheet();
          let accBalance = acc.getAccoutMap()[accNum].accBalance;

          transAmount = parseFloat(transAmount).toFixed(2);
          accBalance = parseFloat(accBalance).toFixed(2);

          this.spreadSheet.getSheetByName(spreadNames)
          .appendRow([transId, accNum,tripId, transType, 
          Utilities.formatDate(new Date(transDate), 'GMT+0200', 'd MMMM yyyy'), 
          transAmount, accBalance]);

          console.log(idChecks.getTransID(transId).tranId.updateStatus('Used'));
          return 'Successfully added new transaction with the following details: '+
          [transId, accNum, transType, Utilities.formatDate(new Date(transDate), 'GMT+0200', 'd MMMM yyyy'), 
          transAmount, accBalance];
      }
      else{
        return 'Failed to add new payment trasaction to the spreadsheet named: '+ spreadNames;
      }      
    }catch(e){
      console.error(e);
      console.log('Failed to record new payment transaction.')
    }
  }

  getCapturedPaymentMap(spreadNames, startRow){
    spreadNames = spreadNames || 'CapturePayment';
    startRow = startRow || 1;
    let paymentMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(data[i][0].toString().replaceAll(" ", "") != "" && data[i][1].toString().replaceAll(" ", "") != ""){
        paymentMap[data[i][0].toUpperCase()] = new capturePayment(data[i][0].toUpperCase(), data[i][1].toUpperCase(), 
        new Date(data[i][2]), parseFloat(data[i][3]), data[i][4]);
      }
    }
    return paymentMap;
  }

  /**
   * Create an altenative function to get this information
   */
  /*
  getUserCaptureTripMap(userid, spreadNames){
    spreadNames = spreadNames || 'CaptureTrip';
    let useTripMap = new Map();
    for(let trip in this.getCapturedTripMap()){
      if(this.getCapturedTripMap()[trip].userId.toUpperCase() == userid.toUpperCase() &&
        this.getCapturedTripMap()[trip].status.toLowerCase() != 'paid'){
        useTripMap[this.getCapturedTripMap()[trip].tripId] = this.getCapturedTripMap()[trip].getCaptureTripMap();
      }
    }
    return useTripMap;
  }
  */

  /**
   * New updated passenger trip
   */
  getPassCapturedTripMap(userid, spreadNames, querySpreadSheet){
    let lock = LockService.getScriptLock();
    lock.waitLock(400000);
    let useTripMap = new Map();
    spreadNames = spreadNames || 'CaptureTrip';
    querySpreadSheet = querySpreadSheet || 'QuerySet_2';
    if(this.checkTransQuerySet(
      '=QUERY(' + spreadNames + '!A:I,"Select A, B, C, D, E, F, G, H, I Where G = \'Unpaid\' and B = \'' + userid.toUpperCase() + '\'",1)', querySpreadSheet
      )){
      let data = this.spreadSheet.getSheetByName(querySpreadSheet).getDataRange().getValues();
      for(let i = 1; i < data.length; i++){
        let trip  = new captureTrips(data[i][0].toUpperCase(), data[i][1].toUpperCase(), 
        parseFloat(data[i][2]), new Date(data[i][3]), data[i][4], data[i][5], data[i][6].toLowerCase(), 
        data[i][7].toUpperCase(), data[i][8]);
        useTripMap[trip.tripId] = trip.getCaptureTripMap();
      }
    }
    lock.releaseLock();
    return useTripMap;
  }

  /**
   * return an object of a trip
   */
  getTrip(querySet, querySpreadSheet, row){
    //declared variables
    querySpreadSheet = querySpreadSheet || 'QuerySet_2';
    row = row || 1;
    //check if there is a presence of a trip
    if(this.checkTransQuerySet(querySet, querySpreadSheet)){
      //read data from the spreadsheet.
      let data = this.spreadSheet.getSheetByName(querySpreadSheet).getDataRange().getValues();
      //Return an object of the trip
      return new captureTrips(data[row][0].toUpperCase(), data[row][1].toUpperCase(), 
        parseFloat(data[row][2]), new Date(data[row][3]), data[row][4], data[row][5], data[row][6].toLowerCase(), 
        data[row][7].toUpperCase(), data[row][8]);
    }
    return undefined;
  }

  /**
   * 
   */
  getCapturedTripMap(spreadNames, startRow){
    spreadNames = spreadNames || 'CaptureTrip';
    startRow = startRow || 1;
    let tripMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(data[i][0].toString().replaceAll(" ", "") != "" && data[i][1].toString().replaceAll(" ", "") != ""){
        tripMap[data[i][0].toUpperCase()] = new captureTrips(data[i][0].toUpperCase(), data[i][1].toUpperCase(), 
        parseFloat(data[i][2]), new Date(data[i][3]), data[i][4], data[i][5], data[i][6].toLowerCase(), 
        data[i][7].toUpperCase(), data[i][8]);
      }
    }
    return tripMap;
  }

  /**
   * 
   */
  getTransactionMap(spreadNames, startRow){
    spreadNames = spreadNames || 'AccountTransaction';
    startRow = startRow || 1;
    let transMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(data[i][0] != ''){
        transMap[data[i][0].toUpperCase()] = new accountTransaction(data[i][0].toUpperCase(), data[i][1],
        data[i][2], data[i][3], data[i][4], data[i][5], data[i][6], data[i][7]);
      }
    }
    return transMap;
  }

  getTransactionList(spreadNames, startRow){
    spreadNames = spreadNames || 'AccountTransaction';
    startRow = startRow || 1;
    return Object.values(this.getTransactionMap(spreadNames, startRow));
  }

  getTranQuerySetList(query, spreadNames, startRow){
    let lock = LockService.getScriptLock();
    lock.waitLock(200000);
    spreadNames = spreadNames || 'QuerySet';
    startRow = startRow || 1;
    this.spreadSheet.getSheetByName(spreadNames).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    let data = this.spreadSheet.getSheetByName(spreadNames).getDataRange().getValues();
    let transList = [];
    for(let i = startRow; i < data.length; i++){
      transList.push(new accountTransaction(data[i][0].toUpperCase(), 
        data[i][1], data[i][2], data[i][3], data[i][4], data[i][5], data[i][6]));
    }
    lock.releaseLock();
    return transList;
  }

  checkTransQuerySet(query, spreadNames){
    let lock = LockService.getScriptLock();
    lock.waitLock(200000);
    spreadNames = spreadNames || 'QuerySet_2';
    this.spreadSheet.getSheetByName(spreadNames).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    lock.releaseLock();
    return this.spreadSheet.getSheetByName(spreadNames).getDataRange().getValues().length > 1;
  }
  getCapturedTripList(spreadNames, startRow){
    spreadNames = spreadNames || 'CaptureTrip';
    startRow = startRow || 1;
    return Object.values(this.getCapturedTripMap(spreadNames,  startRow));
  }

  getCapturedPaymentList(spreadNames, startRow){
    spreadNames = spreadNames || 'CapturePayment';
    startRow = startRow || 1;
    return Object.values(this.getCapturedPaymentMap(spreadNames, startRow));
  }

  getCapturedTrip(row, spreadNames){
    spreadNames = spreadNames || 'CaptureTrip';
    row = row || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    return new captureTrips(data[row][0].toUpperCase(), data[row][1].toUpperCase(), parseFloat(data[row][2]),
        new Date(data[row][3]), data[row][4], data[row][5], data[row][6].toLowerCase());
  }
  getTransaction(userId){
    for(let i = 0; i < this.getTransactionList().length; i++){
      if(userId.toUpperCase() == this.getTransactionList()[i]){
        return this.getTransactionList()[i];
      }
    }
  }

  getCapturedPayment(row, spreadNames){
    spreadNames = spreadNames || 'CapturePayment';
    row = row || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    return new capturePayment(data[row][0].toUpperCase(), data[row][1].toUpperCase(), 
          parseFloat(data[row][3]), new Date(data[row][2]));
  }

  removeTransaction(transId, spreadNames){
    try{
      spreadNames = spreadNames || 'AccountTransaction';
      let trans = this.getTransactionMap()[transId].getTransactionList();
      this.spreadSheet.getSheetByName(spreadNames)
        .deleteRow(this.getTransactionMap()[transId].getRowNumber() + 1);
      SpreadsheetApp.flush();
      return trans;
    }catch(e){
      console.error(e);
      return -1;
    }
  }

  removeCapturedTrip(tripId, spreadNames){
    try{
      spreadNames = spreadNames || 'CaptureTrip';
      this.spreadSheet.getSheetByName(spreadNames)
        .deleteRow(this.getCapturedTripMap()[tripId.toUpperCase()].getRowNumber() + 1);
      SpreadsheetApp.flush();
      return 'Successfully deleted the row with the trip id: '+ tripId;
    }catch(e){
      console.error(e);
      return 'Failed to delete the row with trip id: '+ tripId;
    }
  }

  removeCapturedPayment(pymId, spreadNames){
    try{
      spreadNames = spreadNames || 'CapturePayment';
      this.spreadSheet.getSheetByName(spreadNames)
        .deleteRow(this.getCapturedPaymentMap()[pymId.toUpperCase()].getRowNumber() + 1);
      SpreadsheetApp.flush();
      return 'Successfully deleted the row with the trip id: '+ pymId;
    }catch(e){
      console.error(e);
      return 'Failed to delete the row with trip id: '+ pymId;
    }
  }

  updateCapturedPayment(pymId, head, details){
    let resp = '';
    try{
      if(head.toLowerCase() == 'user id'){
        resp = this.getCapturedPaymentMap()[pymId.toUpperCase()].updateUserId(details.toUpperCase());
      }
      else if(head.toLowerCase() == 'date of payment'){
        resp = this.getCapturedPaymentMap()[pymId.toUpperCase()].updatePaymentDate(details);
      }
      else if(head.toLowerCase() == 'amount payed'){
        resp = this.getCapturedPaymentMap()[pymId.toUpperCase()].updatePaymentAmount(details);
      }
      else{
        resp = 'Invalid key: '+ head;
      }
      return resp;
    }catch(e){
      console.error(e);
      console.log("An error occured while updating trip with the following ID: "+ tripId);
      console.log(details);
      return "An error occured while updating trip with the following ID: "+ tripId;
    }
  }

  updateCapturedTrip(tripId, head, details){
    let resp = '';
    try{
        if(head.toLowerCase() == 'user id'){
          resp = this.getCapturedTripMap()[tripId].updateUserId(details.toUpperCase());
        }
        else if(head.toLowerCase() == 'trip amount'){
          resp = this.getCapturedTripMap()[tripId].updateAmount(parseFloat(details).toFixed(2));
        }
        else if(head.toLowerCase() == 'trip date'){
          resp = this.getCapturedTripMap()[tripId].updateDate(details);
        }
        else if(head.toLowerCase() == 'from location'){
          resp = this.getCapturedTripMap()[tripId].updateFromLoc(details);
        }
        else if(head.toLowerCase() == 'to location'){
          resp = this.getCapturedTripMap()[tripId].updateToLoc(details);
        }
        else if(head.toLowerCase() == 'status'){
          resp = this.getCapturedTripMap()[tripId].updateStatus(details);
        }
        else{
          resp = 'Invalid key: '+ head;
        }
      return resp;
    }catch(e){
      console.error(e);
      console.log("An error occured while updating trip with the following ID: "+ tripId);
      console.log(details);
      return "An error occured while updating trip with the following ID: "+ tripId;
    }
  }  
}
