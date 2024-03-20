
/**
 * 
 */
class accountTransaction{
  constructor(transId, accNumb, tripId, transType, transDate, transAmt, bal, comm, spreadSheetId, spreadSheetName){
    this.transId = transId.toUpperCase();
    this.accountNumb = parseInt(accNumb);
    this.tripId = tripId;
    this.transType = transType;
    this.transDate = new Date(transDate);
    this.transAmount = parseFloat(transAmt);
    this.accountBalance = parseFloat(bal);
    this.comments = comm || '';

    this.spreadSheetId = spreadSheetId ||'1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetName = spreadSheetName || 'AccountTransaction';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber] == this.transId){
        return i;
      }
    }
    return -1;
  }
  
  getTransactionList(){
    return [this.transId, this.accountNumb,this.tripId, this.transType, this.transDate,
      this.transAmount, this.accountBalance, this.comments];
  }

  getTransactionMap(rowHeading, header){
    rowHeading = rowHeading || 0;
    header = header || this.spreadSheetData.getDataRange().getValues()[rowHeading];
    let transMap = new Map();
    for(let i = 0; i < this.getTransactionList().length; i++){
      transMap[header[i].toLowerCase()] = this.getTransactionList()[i];
    }
    return transMap;
  }

  getTransactionJSON(){
    return JSON.stringify(this.getTransactionMap());
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateTransType(transType, col){
    try{
      col = col || 3;
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, transType,
      'Succesfully updated the transaction type to ' + transType);
      this.transType = transType;
      return resp;
    }catch(e){
      console.error(e);
      console.log('Failed to update transaction type to '+ transType);
      return -1;
    }
  }

  updateTransAmount(transAmt, col){
    try{
      col = col || 5;
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseFloat(transAmt).toFixed(2),
      'Succesfully updated transaction amount to R' + parseFloat(transAmt).toFixed(2));
      this.transAmount = parseFloat(transAmt);
      return resp;
    }catch(e){
      console.error(e);
      console.log("Failed to update transaction trip amount to "+ transAmt);
      return -1;
    }
  }
}

/**
 * 
 */
class transactionManager{
  constructor(){
    this.tripDetails = undefined;
    this.payment = undefined;
    this.passId = '';
    this.driverId = '';
    this.amountPayed = '';
  }

  getUserTransactions(){
    //initialise Objects.
    let accTracker = new transportDatabaseSheet();
    let transTracker = new collectionDatabase();
    let trans = new Map();

    /**
     * - Get a passenger Account using passenger Id.
     */
    let acc = accTracker.getAccout(this.passId).accountNumb;
    let tempTransTracker = transTracker.getTranQuerySetList(
      '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where B = ' + acc + '",1)');
    for(let i = 0; i < tempTransTracker.length; i++){
      /**
       * - Get the transaction using the passenger account.
       * - Get the trip id from the transaction and use it to verify if the trip is paid.
       * - If the trip is not paid, the transaction is added to the Array of transaction Map().
       */
        if(transTracker.checkTransQuerySet(
          '=QUERY(CaptureTrip!A:I,"Select A, B, C, D, E, F, G, H, I Where G = \'Unpaid\' and A = \''
          +tempTransTracker[i].tripId+'\'",1)'
        )){
          trans[tempTransTracker[i].transId] = tempTransTracker[i];
        }
    }

    /**
     * - Return an Array of Map for unpaid passenger trips.
     */
    return trans;
  }

  /**
   * Return an object of an unpaid trip.
   */
  getPassUnpaidTrip(spreadNames, status, querySet){
    //declaring objects 
    spreadNames = spreadNames || 'CaptureTrip';
    status = status || 'Unpaid';
    querySet = querySet ||'=QUERY(' + spreadNames + '!A:I,"Select A, B, C, D, E, F, G, H, I Where G = \'' + status + '\' and B = \'' + this.passId.toUpperCase() + '\'",1)'
    let dataCol = new collectionDatabase();

    return dataCol.getTrip(querySet);
  }

  /**
   * Return an object of an paid trip.
   */
  getPassPaidTrip(){

  }
  setTransPaymentsDetails(userTrans, transId, i, dataCol, transTrack, passAcc, transIdTrack){
    /**
     * - Check if the amount paid is greater that 0 and greater than or equal to the current trip.
     */
    let passTrans = userTrans[transId[i]];
    if((this.amountPayed > 0) && (this.amountPayed >= (passTrans.transAmount * -1))){

      /**
       * - Collect the following information:
       * - Collect trip Id from passenger Id.
       * - Get a trip object using trip Id.
       * - Get driver id from the trip object.
       * - Get a driver account number using driver id.
       * - Get a driver transaction object using trip id and driver account number.
       */
      let tripId = passTrans.tripId;
      let trip = dataCol.getCapturedTripMap()[tripId];
      let driverId = trip.driveId;
      let driverAcc = transTrack.getAccout(driverId);
      let driverTrans = dataCol.getTranQuerySetList(
      '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + tripId + '\' and B = '+ driverAcc.accountNumb + '",1)')[0];

      /**
       * - Debit a trip amount from the passenger account.
       * - Debit a trip amount from the driver account.
       */
      console.log(driverAcc.updateAccBalance(passTrans.transAmount));
      console.log(passAcc.updateAccBalance(driverTrans.transAmount));

      /**
       * - Update the summary information as follow:
       * - Subtract 1 day from the total number of unpaid days.
       * - Increase the total number of paid days by 1 day.
       * - Subtract outstanding amount with the trip amount.
       * - Add trip amount to amount paid
       */
      transTrack.updateUserSummary(this.passId,'total number of unpaid days',-1);
      transTrack.updateUserSummary(this.passId,'total number of paid days',1);
      transTrack.updateUserSummary(this.passId,'outstanding amount', passTrans.transAmount);
      transTrack.updateUserSummary(this.passId,'amount paid', driverTrans.transAmount);

      /**
       * - Subtract the trip amount from the amount paid.
       */
      this.amountPayed = this.amountPayed - driverTrans.transAmount;

      /**
       * - Update the transaction status of driver to Completed 
       * - Remove the driver transaction from the data collection sheet.
       * - Update the transaction status of passenger to Completed.
       * - Remove the passenger transaction from the data collection sheet.
       * - Update the trip status to Paid
       */
      console.log(transIdTrack.getTransID(passTrans.transId).tranId.updateStatus('Completed'));
      console.log(dataCol.removeTransaction(passTrans.transId));
      console.log(transIdTrack.getTransID(driverTrans.transId).tranId.updateStatus('Completed'));
      console.log(dataCol.removeTransaction(driverTrans.transId));
      console.log(trip.updateStatus('Paid'));
    }
  }

  /**
   * The new vesion of payment.
   */
  updatePayment(payment){
    //initialise class attributes
    this.payment = payment
    this.passId = this.payment.userId;
    this.amountPayed = parseFloat(this.payment.amountPayed);
    this.driverId = payment.driverId;

    //Create Objects
    let transTrack = new transportDatabaseSheet();

    //getting an object of the account.
    let passAcc = transTrack.getAccout(this.passId);

    //updating account of the passenger with the amount payed.
    console.log(passAcc.updateAccBalance(this.amountPayed));

    //update the outstanding amount of the user.
    if(passAcc.accBalance > 0){
      if(transTrack.getUserSummaryMap()[this.passId].outAmount > 0){
        transTrack.updateUserSummary(this.passId,'outstanding amount', -(this.amountPayed - passAcc.accBalance));
      }
      else{
        transTrack.updateUserSummary(this.passId,'outstanding amount', 
          (transTrack.getUserSummaryMap()[this.passId].outAmount * -1));
      }
    }
    else{
      transTrack.updateUserSummary(this.passId,'outstanding amount', -(this.amountPayed));
    }

    //Update amount payed
    transTrack.updateUserSummary(this.passId,'amount paid', this.amountPayed);
    //Update the number of payments for the drive.
    transTrack.getDriverSummary()[this.driverId].updateNumbPayments();
    //Updating payment status
    console.log(transIdTrack.getPaymentID(this.payment.paymentId).paymentId.updateStatus('Completed'));

    return 'Successfully update passenger account and outstanding amount';

  }

  updateTransPayments(logTracker){
    logTracker.updateSpreadSheetCell(i + 1, 6, 'Inprogress', 'Successfull updated payment status to Inprogress on the transaction log.');
    //initialise class attributes
    this.payment = new capturePayment(logTracker.paymentId, logTracker.passId, 
        logTracker.paydate, logTracker.amount, logTracker.userId);
    this.passId = this.payment.userId;
    this.amountPayed = parseFloat(this.payment.amountPayed);
    this.driverId = payment.driverId;
    

    //Create Objects
    let dataCol = new collectionDatabase();
    let pasTrip = this.getPassUnpaidTrip();
    //if there is not trip to process, I stop processing
    if(pasTrip == undefined){
      logTracker.closePayment('Closed');
      return;
    }

    let transTrack = new transportDatabaseSheet();
    let transIdTrack = new idTracker();
    let driverAcc = transTrack.getAccout(this.driverId);
    let analy = new analytic();

    if(this.amountPayed >= pasTrip.amount){
      //update the status of the payment trip to Payed
      pasTrip.updateStatus('Payed');
      //Get all the trip of the transaction
      let trans = dataCol.getTranQuerySetList(
      '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + pasTrip.tripId + '\'",1)');
      for(let i = 0; i < trans.length; i++){
        //append all the trip transactions to the analitic sheet.
        analy.capTransHistory(trans[i].getTransactionList())
        //set the status of the transaction id to completed.
        console.log(transIdTrack.getTransID(trans[i].transId).tranId.updateStatus('Completed'));
        //check if the transaction belongs to the driver
        if(driverAcc.accountNumb == trans[i].accountNumb){
          //update the driver account with the trip amount. Subtract the trip amount from the drive account.
          console.log(trans[i].updateAccBalance(-pasTrip.amount));
          //reduce the amount on the logTracker by the trip amount.
          console.log(logTracker.updateAmount(pasTrip.amount));
        }
      }
      if(logTracker.amount > 0){
        //If the amount to the log tracker is still greater than 0 set status to waiting for the next updaid trip to be processed.
        logTracker.updateSpreadSheetCell(i + 1, 6, 'Waiting', 'Successfull updated payment status to waiting on the transaction log.');
      }else{
        //Close the transaction and remove this transaction from the logTracker.
        logTracker.updateSpreadSheetCell(i + 1, 6, 'Closed', 'Successfull updated payment status to closed on the transaction log.');
        logTracker.closePayment('Closed');
      }
        
    }else{
      //If the trip amount is more than the amount payed.

    }

            /**
       * - Update the transaction status of driver to Completed 
       * - Remove the driver transaction from the data collection sheet.
       * - Update the transaction status of passenger to Completed.
       * - Remove the passenger transaction from the data collection sheet.
       * - Update the trip status to Paid
       */
      /*
      console.log(transIdTrack.getTransID(passTrans.transId).tranId.updateStatus('Completed'));
      console.log(dataCol.removeTransaction(passTrans.transId));
      console.log(transIdTrack.getTransID(driverTrans.transId).tranId.updateStatus('Completed'));
      console.log(dataCol.removeTransaction(driverTrans.transId));
      console.log(trip.updateStatus('Paid')); */
      
   // }
    
    

    

      // /**
      //  * - Get all unpaid trips transactions that were taken by the passenger.
      //  */
      // let userTrans = this.getUserTransactions();
      // let transId = Object.keys(userTrans);
      // console.log(transId);
      // /**
      //  * - Get a passenger account number using passenger id.
      //  */
      // let passAcc = transTrack.getAccout(this.passId);
      // let tempPassAmout = 0;

      // /**
      //  * - Check if the passenger account is greater than 0.
      //  * - Add the passenger amount to the amount paid.
      //  * - Reset the account of the passenger to 0.
      //  */
      // if(passAcc.accBalance > 0){
      //   tempPassAmout = passAcc.accBalance;
      //   this.amountPayed += tempPassAmout;
      //   passAcc.updateAccBalance(-tempPassAmout);
      // }

      // /**
      //  * - Loop through all the unpaid passenger transaction.
      //  */
      // for(let i = 0; i < transId.length; i++){
      //  this.setTransPaymentsDetails(userTrans, transId, i, 
      //   dataCol, transTrack, passAcc, transIdTrack);
      // }

      /**
       * - Update the passenger account with the remaining amount from the amount paid.
       * - Update the status of the payment transaction to Complete.
       * - Update the passenger summary amount to the amount paid.
       */
      //console.log(transTrack.getAccout(this.passId).updateAccBalance(this.amountPayed));
      //console.log(transIdTrack.getPaymentID(this.payment.paymentId).paymentId.updateStatus('Completed'));

      transTrack.updateUserSummary(this.passId,'amount paid', (this.amountPayed - tempPassAmout));
      //acc.getDriverSummary()[this.driverId].updateNumbPayments();
      return 'Successfully updated the transactions'; 
  }

  setTripDetails_1(passAccount, driverAcc, tripData, tripId, acc, idTr){
    /**
     * - The amount on the Passenger account is debited by the trip amount.
     * - The driver account is updated by 0.
     */
    console.log(passAccount.updateAccBalance(-this.tripDetails['amount']));
    console.log(driverAcc.updateAccBalance(0));

    /**
     * - A new trip Id is generated and the status of this trip is set to paid.
     */
    console.log(tripData.addNewTrip(tripId.tripId.generatedId, this.passId, this.amountPayed,
      this.tripDetails['date'], this.tripDetails['fromloc'], this.tripDetails['fromloc'],
      'Paid', this.driverId));

    /**
     * - The transaction for the driver trip is generated and recorded in the historic data 
     *    including the Passenger transaction.
     */
    tripData.addNewTransaction(this.passId,  -this.tripDetails['amount'], tripId.tripId.generatedId, 'Trip debit');
    tripData.addNewTransaction(this.driverId,  0.00, tripId.tripId.generatedId, 'Trip Payment');

    /**
     * - The summary tracker updates the number of paid days by 1,
     * - Then it increases the amount paid by trip amount. 
     * - Then increase the total number of trips by 1.
     */
    console.log(acc.updateUserSummary(this.passId, 'total number of days', 1));
    console.log(acc.updateUserSummary(this.passId, 'amount paid', this.tripDetails['amount']));
    console.log(acc.updateUserSummary(this.passId, 'total number of paid days',1));

    /**
     * - Update the status of the trip to payed
     */
    console.log(tripId.tripId.updateStatus('Payed'));

    /**
     * - Update the transaction status from used to Completed.
     */
    let transaction = tripData.getTranQuerySetList(
      '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + tripId.tripId.generatedId + '\' and B = '+ driverAcc.accountNumb + '",1)')[0];
    console.log(idTr.getTransID(transaction.transId).tranId.updateStatus('Completed'));
    transaction = tripData.getTranQuerySetList(
      '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + tripId.tripId.generatedId + '\' and B = '+ passAccount.accountNumb + '",1)')[0];
    console.log(idTr.getTransID(transaction.transId).tranId.updateStatus('Completed'));
  }

  setTripDetails_2(passAccount, driverAcc, tripData, tripId, acc){
    /**
     * - Subtract the passenger account with the trip amount. This means that the passenger account will stay at negative balance.
     * - The remaining amount after subtracting the amount above zero From Passenger account is added to the driver account 
     *    (Example: driver balance = driver balance + (-1 X (trip amount - passenger balance)).
     */
    console.log(passAccount.updateAccBalance(-this.amountPayed));
    console.log(driverAcc.updateAccBalance(passAccount.accBalance * -1));

    /**
     * - Update the total number of trips by 1.
     * - Update the total number of Unpaid trips to 1.
     * - Update an unpaid amount to the remaining amount from the trip.
     * - Update the paid trips by the amount greater than 0 from the Passenger account.
     */
    console.log(acc.updateUserSummary(this.passId, 'total number of days', 1));
    console.log(acc.updateUserSummary(this.passId, 'total number of unpaid days', 1));
    console.log(acc.updateUserSummary(this.passId, 'outstanding amount', passAccount.accBalance * -1));
    console.log(acc.updateUserSummary(this.passId, 'amount paid', this.amountPayed));

    /**
     * - Create a new trip tracker with the remaining amount as outstanding.
     */
    console.log(tripData.addNewTrip(tripId.tripId.generatedId, this.passId, passAccount.accBalance * -1,
      this.tripDetails['date'], this.tripDetails['fromloc'], this.tripDetails['fromloc'],
      'Unpaid', this.driverId));

    /**
     * - Create 2 transactions for the driver and the Passend and track them
     */
    tripData.addNewTransaction(this.passId,  passAccount.accBalance, tripId.tripId.generatedId, 'Trip debit');
    tripData.addNewTransaction(this.driverId,  passAccount.accBalance * -1, tripId.tripId.generatedId, 'Trip Payment');

    /**
     * - Update the trip id status from Free status to Used Status
     */
    console.log(tripId.tripId.updateStatus('Used'));
  }

  setTripDetails_3(passAccount, driverAcc, tripData, tripId, acc){
    /**
     * - Subtract the trip amount from the Passenger balance Account.
     * - Add the trip amount to the driver amount Account.
     */
    console.log(passAccount.updateAccBalance(-this.amountPayed));
    console.log(driverAcc.updateAccBalance(this.amountPayed));

    /**
     * - Add the number of unpaid trips by 1. 
     * - The amount of the trip to the unpaid amount. 
     * - Add a trip to the total number of trips.
     */
    console.log(acc.updateUserSummary(this.passId, 'total number of days', 1));
    console.log(acc.updateUserSummary(this.passId, 'total number of unpaid days', 1));
    console.log(acc.updateUserSummary(this.passId, 'outstanding amount', this.amountPayed));

    /**
     * - Capture the trip details with an unpaid status.
     */
    console.log(tripData.addNewTrip(tripId.tripId.generatedId, this.passId, this.amountPayed,
    this.tripDetails['date'], this.tripDetails['fromloc'], this.tripDetails['toloc'],
    'Unpaid', this.driverId));

    /**
     * - Generate the trip transaction for both the passenger and the driver.
     */
    tripData.addNewTransaction(this.passId,  -this.amountPayed, tripId.tripId.generatedId, 'Trip debit');
    tripData.addNewTransaction(this.driverId,  this.amountPayed, tripId.tripId.generatedId, 'Trip Payment');
  }

  /**
   * This function will capture the details of the new trip.
   */
  updateTrip(tripDetails, tripsumId, transSumId){
    tripsumId = tripsumId || 206;
    transSumId = transSumId || 209;
    this.tripDetails = tripDetails;
    this.passId = this.tripDetails['passId'];
    this.amountPayed = this.tripDetails['amount'];
    this.driverId = this.tripDetails['driverid'];
    
    /**
     * creating objects.
     */
    let acc = new transportDatabaseSheet();
    let idTr = new idTracker();
    let tripData = new collectionDatabase();
    let attMsg = new messages();

    let passAccount = acc.getAccout(this.passId);
    let driverAcc = acc.getAccout(this.driverId);

    let tripId = idTr.getSummaryIdMap()[tripsumId].createTripId();

    if(passAccount.accBalance > 0){
      if(passAccount.accBalance >= this.tripDetails['amount']){
        this.setTripDetails_1(passAccount, driverAcc, tripData, tripId, acc, idTr);
        attMsg.addNewAttMsg(this.driverId, this.passId, new Date(),
          'The trip that you took from ' + this.tripDetails['date'] + ' was successfully captured.'
          , 'Unread');
        attMsg.addNewAttMsg(this.driverId, this.driverId, new Date(),
          'The trip for '+ this.passId + ' - '  + ' was successfully captured on the '+ Utilities.formatDate(new Date(this.tripDetails['date']), 'GMT+0200', 'd MMMM yyyy') + '.'
          , 'Unread');
        acc.getDriverSummary()[this.driverId].updateNumbTrips();
        return 'Success fully captured trip details';
      }
      else{
        this.setTripDetails_2(passAccount, driverAcc, tripData, tripId, acc);
        attMsg.addNewAttMsg(this.driverId, this.passId, new Date(),
          'The trip that you took from ' + this.tripDetails['date'] + ' was successfully captured.'
          , 'Unread');
        attMsg.addNewAttMsg(this.driverId, this.driverId, new Date(),
          'The trip for '+ this.passId + ' - '  + ' was successfully captured on the '+ Utilities.formatDate(new Date(this.tripDetails['date']), 'GMT+0200', 'd MMMM yyyy') + '.'
          , 'Unread');
        acc.getDriverSummary()[this.driverId].updateNumbTrips();
        return 'Success fully captured trip details';
      }
    }
    else{
      this.setTripDetails_3(passAccount, driverAcc, tripData, tripId, acc);
      attMsg.addNewAttMsg(this.driverId, this.passId, new Date(),
        'The trip that you took from ' + this.tripDetails['date'] + ' was successfully captured.'
        , 'Unread');
      attMsg.addNewAttMsg(this.driverId, this.driverId, new Date(),
        'The trip for '+ this.passId + ' - '  + ', was successfully captured on the '+ Utilities.formatDate(new Date(this.tripDetails['date']), 'GMT+0200', 'd MMMM yyyy') + '.'
        , 'Unread');
      acc.getDriverSummary()[this.driverId].updateNumbTrips();
      return 'Success fully captured trip details';
    }
  }
}
