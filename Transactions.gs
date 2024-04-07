
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
  
  updateComments(com, col){
    this.comments = com
    col = col || 8;
    return this.updateSpreadSheetCell(this.getRowNumber() + 1, col, com, 'Successfully update transaction comments to: \n'+com);
  }

  removeTransact(rowNumb){
    rowNumb = rowNumb || this.getRowNumber() + 1;
    this.spreadSheetData.deleteRow(rowNumb);
    return "Successfully removed the transaction with the following details from Transaction Tracker:\n" +
    this.getTransactionMap() + "\nRow Number: " + rowNumb;
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
      col = col || 6;
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
  getPassPaidTrip(spreadNames, status, querySet){
    //declaring objects 
    spreadNames = spreadNames || 'CaptureTrip';
    status = status || 'Paid';
    querySet = querySet ||'=QUERY(' + spreadNames + '!A:I,"Select A, B, C, D, E, F, G, H, I Where G = \'' + status + '\'",1)'
    let dataCol = new collectionDatabase();

    return dataCol.getTrip(querySet);
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
    let transIdTrack = new idTracker();

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

  /**
   * 
   */
  updateTransPayments(logTracker){
    //Update the log tracker status to inprogress
    console.info(logTracker.setStatus('Inprogress', 'Successfull updated payment status to Inprogress on the transaction log.'));
    //Update Date status on the log Tracker.
    console.info(logTracker.setStatusDate(generalFunctions.formatDateTime(), 
    'Successfull updated Date status to the current date'));

    //initialise class attributes
    this.payment = new capturePayment(logTracker.paymentId, logTracker.passId, 
        logTracker.paydate, logTracker.amount, logTracker.userId);
    this.passId = this.payment.userId;
    this.amountPayed = parseFloat(this.payment.amountPayed);
    this.driverId = this.payment.driverId;

    //search all upaid trips of the passenger.
    let pasTrip = this.getPassUnpaidTrip();   //return an object of captureTrips() class
    //if there is not trip to process, I stop processing
    if(pasTrip == undefined){
      logTracker.closePayment();
      return logTracker.payTripList();
    }
    console.info(pasTrip.updateComments('Inprogress: '+ generalFunctions.formatDateTime()));
    //Create Objects
    let transTrack = new transportDatabaseSheet();
    let driverAcc = transTrack.getAccout(this.driverId);  //return an object of account() class for the driver.
    let passAcc = transTrack.getAccout(this.passId);  //return an object of account() class for the passenger.
    let dataCol = new collectionDatabase();
    let transHist = new transactionHistory();
    //Get all the trip of the transaction
    // return a list of objects of accountTransaction() class
    let trans = dataCol.getTranQuerySetList(
        '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + pasTrip.tripId + '\'",1)'
      );

    if(this.amountPayed >= pasTrip.amount){ //amount from log Tracker greater than amount of the selected trip
      //iterate over the list of transactions.
      for(let i = 0; i < trans.length; i++){
        console.info(trans[i].updateComments('Inprogress: '+ generalFunctions.formatDateTime()));
        //check if the transaction was the driver transaction.
        if(driverAcc.accountNumb == trans[i].accountNumb){
          //update the driver account with the trip amount. Subtract the trip amount from the drive account.
          console.info(driverAcc.updateAccBalance(-1 * trans[i].transAmount));
          //Adding the transaction to the paid transaction history
          transHist.addTrans(
            [trans[i].transId, trans[i].accountNumb,trans[i].tripId, 'Trip debit', generalFunctions.formatDate(trans[i].transDate),
              parseFloat(-1 * trans[i].transAmount).toFixed(2), parseFloat(driverAcc.accBalance).toFixed(2), 
              generalFunctions.formatDateTime(), parseFloat(pasTrip.amount).toFixed(2),parseFloat(0).toFixed(2)],
            'PaidTransactionHistory'
            );

        }else{
          //Adding the transaction to the paid transaction history
          transHist.addTrans(
            [trans[i].transId, trans[i].accountNumb,trans[i].tripId, 'Trip Payment', 
            generalFunctions.formatDate(trans[i].transDate),parseFloat(-1 * trans[i].transAmount).toFixed(2), 
            parseFloat(passAcc.accBalance).toFixed(2), generalFunctions.formatDateTime(), parseFloat(pasTrip.amount).toFixed(2),parseFloat(0).toFixed(2)],
            'PaidTransactionHistory'
            );
        }
        //update the Id of the transaction
        this.completeTransactionID(trans[i].transId);

        //add all unpaid transaction to the transaction data history without changes.
        transHist.addTrans(
          trans[i].getTransactionList(),
          'UnpaidTransactionHistory'
          );
          //remove the transaction from the Datacollection Tracker.
        console.info(trans[i].removeTransact());
      }

      //add trip details to the Transaction data history.
      transHist.addTrans(pasTrip.getCaptureTripsList(), 'UnpaidTripHistory');
      //update the status of the payment trip to Payed
      pasTrip.updateStatus('Payed');
      //Creating the list for paid trip transaction.
      let pasTripList = pasTrip.getCaptureTripsList().slice(0,-1);
      pasTripList.push(generalFunctions.formatDateTime());
      pasTripList.push(parseFloat(pasTrip.amount).toFixed(2));
      pasTripList.push(parseFloat(0).toFixed(2));
      //add trip details to the Transaction data history.
      transHist.addTrans(pasTripList, 'PaidTriphistory');
      //complete the trip process.
      console.info(pasTrip.updateComments('Completed: '+ generalFunctions.formatDateTime()));
      //remove the trip from the captured datacollector
      pasTrip.removeTrip();

      //decrease the total number of unpaid trips by 1
      transTrack.updateUserSummary(this.passId,'total number of unpaid days',-1);
      //Increase the total number of paid trips by 1
      transTrack.updateUserSummary(this.passId,'total number of paid days',1);

      //Update the status of the trip
      this.completeTripID(pasTrip.tripId);

      //update the amount of the trip log.
      console.info(logTracker.updateAmount(pasTrip.amount));

      //Check if there is still amount left for another trip.
      if(logTracker.amount > 0){
        //If the amount to the log tracker is still greater than 0 set status to waiting for the next updaid trip to be processed.
        console.info(logTracker.setStatus('Waiting', 'Successfull updated payment status to waiting on the transaction log.'));
      }else{
        //Close the transaction and remove this transaction from the logTracker.
        console.info(logTracker.setStatus('Closed', 'Successfull updated payment status to closed on the transaction log.'));
        logTracker.closePayment();
      }
    } else if(this.amountPayed > 0){ //amount from log Tracker greater than 0 but not greater that the amount of the trip
      //iterate over the list of transactions.
      for(let i = 0; i < trans.length; i++){
        console.info(trans[i].updateComments('Inprogress: '+ generalFunctions.formatDateTime()));
        //add all unpaid transaction to the transaction data history without changes.
        transHist.addTrans(
          trans[i].getTransactionList(),
          'UnpaidTransactionHistory'
          );
        
        //check if the transaction was the driver transaction.
        if(driverAcc.accountNumb == trans[i].accountNumb){
          //update the driver account with the trip amount. Subtract the trip amount from the drive account.
          console.log(driverAcc.updateAccBalance(-1 * this.amountPayed)); 
          //Adding the transaction to the paid transaction history
          transHist.addTrans(
            [trans[i].transId, trans[i].accountNumb, trans[i].tripId, 'Trip debit', generalFunctions.formatDate(trans[i].transDate),
              parseFloat(-1 * this.amountPayed).toFixed(2), parseFloat(driverAcc.accBalance).toFixed(2), 
              generalFunctions.formatDateTime(), parseFloat(this.amountPayed).toFixed(2),
              parseFloat(pasTrip.amount - this.amountPayed).toFixed(2)],
            'PaidTransactionHistory'
            );
          //Update transaction amount of the driver
          trans[i].updateTransAmount(pasTrip.amount - this.amountPayed);      
        }else{
          //Adding the transaction to the paid transaction history
          transHist.addTrans(
            [trans[i].transId, trans[i].accountNumb,trans[i].tripId, 'Trip Payment', 
            generalFunctions.formatDate(trans[i].transDate),parseFloat(this.amountPayed).toFixed(2), 
            parseFloat(passAcc.accBalance).toFixed(2), generalFunctions.formatDateTime(), parseFloat(this.amountPayed).toFixed(2),parseFloat(pasTrip.amount - this.amountPayed).toFixed(2)],
            'PaidTransactionHistory'
            );
          //Update transaction amount of the driver
          trans[i].updateTransAmount(trans[i].transAmount +  this.amountPayed);  
        }      
      }
      //add trip details to the Transaction data history.
      transHist.addTrans(pasTrip.getCaptureTripsList(), 'UnpaidTripHistory');
      //update the trip Amount
      pasTrip.updateAmount(pasTrip.amount - this.amountPayed);
      //Creating the list for paid trip transaction.
      let pasTripList = pasTrip.getCaptureTripsList().slice(0,-1);
      pasTripList.push(generalFunctions.formatDateTime());
      pasTripList.push(parseFloat(this.amountPayed).toFixed(2));
      pasTripList.push(parseFloat(pasTrip.amount).toFixed(2));
      //add trip details to the Transaction data history.
      transHist.addTrans(pasTripList, 'PaidTriphistory');

      //complete the trip process.
      console.info(pasTrip.updateComments('Completed: '+ generalFunctions.formatDateTime()));

      //update the amount of the trip log.
      console.info(logTracker.updateAmount(this.amountPayed));

      //Close the transaction and remove this transaction from the logTracker.
      console.info(logTracker.setStatus('Closed', 'Successfull updated payment status to closed on the transaction log.'));
      logTracker.closePayment();

    }else{//amount from log Tracker is not greater than 0
      console.info(pasTrip.updateComments('Cancelled execution. '+ generalFunctions.formatDateTime()));
      //Close the transaction and remove this transaction from the logTracker.
      console.info(logTracker.setStatus('Closed', 'Successfull updated payment status to closed on the transaction log.'));
      logTracker.closePayment();
    }
    
    return 'Successfully processed the trip with the following TripId: '+ pasTrip.tripId;
  }

  /**
   * 
   */
  completeTripID(tripId){
    let tripIdTrack = new idTracker();
    let tripHist = new transactionHistory();
    let tripIdTracker = tripIdTrack.gettripsID(tripId); //this is an object of tripsID() class

    //Update the tripid status to paid
    console.info(tripIdTracker.tripId.updateStatus('Paid'));
    //add the trip Id to Transaction Data History.
    console.info(tripHist.addTrans(tripIdTracker.tripId.getGeneratedIDList(), 'TripsIDHistory'));
    //remove the id from the id tracker.
    tripIdTracker.tripId.removeId();
  }

  /**
   * 
   */
  completeTransactionID(transactionId){
    let transIdTrack = new idTracker();
    let transHist = new transactionHistory();
    let transId = transIdTrack.getTransID(transactionId); //this is an object of transactionID() class

    //Update transaction Id to completed
    console.info(transId.tranId.updateStatus('Completed'));
    //add this transaction id to the Transaction Data history
    console.info(transHist.addTrans(transId.getTransactionList(), 'TransactionIDHistory'));
    //remove the id from the id tracker.
    transId.tranId.removeId();

  }
  
  /**
   * 
   */
  updatePaidTrips(){
    //search all paid trips of the passenger.
    let pasTrip = this.getPassPaidTrip();   //return an object of captureTrips() class
    //if there is not trip to process, I stop processing
    if(pasTrip == undefined){
      return false;
    }

    console.info(pasTrip.updateComments('Inprogress: '+ generalFunctions.formatDateTime()));

    let transHist = new transactionHistory();
    let dataCol = new collectionDatabase();
    // return a list of objects of accountTransaction() class
    let trans = dataCol.getTranQuerySetList(
        '=QUERY(AccountTransaction!A:H,"Select A, B, C, D, E, F, G Where C = \'' + pasTrip.tripId + '\'",1)'
      );

    //iterate over the list of transactions.
    for(let i = 0; i < trans.length; i++){
      console.info(trans[i].updateComments('Inprogress: '+ generalFunctions.formatDateTime()));
      let t = 0;
      if(i == 0)
        t = 1;
      transHist.addTrans(
        [trans[i].transId, trans[i].accountNumb,trans[i].tripId, trans[t].transType, generalFunctions.formatDate(trans[i].transDate),
          parseFloat(trans[i].transAmount).toFixed(2), parseFloat(trans[i].accountBalance).toFixed(2), 
          generalFunctions.formatDateTime(), parseFloat(-1 * trans[i].transAmount).toFixed(2),parseFloat(0).toFixed(2)],
        'PaidTransactionHistory'
        );
      //update the Id of the transaction
      this.completeTransactionID(trans[i].transId);

      //add all unpaid transaction to the transaction data history without changes.
      transHist.addTrans(
        trans[i].getTransactionList(),
        'UnpaidTransactionHistory'
        );
        //remove the transaction from the Datacollection Tracker.
      console.info(trans[i].removeTransact());
    }

    //add trip details to the Transaction data history.
    transHist.addTrans(pasTrip.getCaptureTripsList(), 'UnpaidTripHistory');

    //Creating the list for paid trip transaction.
    let pasTripList = pasTrip.getCaptureTripsList().slice(0,-1);
    pasTripList.push(generalFunctions.formatDateTime());
    pasTripList.push(parseFloat(pasTrip.amount).toFixed(2));
    //update the trip Amount
    pasTrip.updateAmount(pasTrip.amount - pasTrip.amount);
    pasTripList.push(parseFloat(pasTrip.amount).toFixed(2));
    //add trip details to the Transaction data history.
    transHist.addTrans(pasTripList, 'PaidTriphistory');

    //complete the trip process.
    console.info(pasTrip.updateComments('Completed: '+ generalFunctions.formatDateTime()));

    //Update the status of the trip
    this.completeTripID(pasTrip.tripId);

    //remove the trip from the captured datacollector
    pasTrip.removeTrip();

    return true;
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