class idTracker {
  constructor(spreadSheetId){
    this.spreadSheetId = spreadSheetId || '18kBtVorjQewTZMKGAx2Jw-So5wNf0Whu756S3pjnY7E';
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  queryId(query, spreadNames){
    let lock = LockService.getScriptLock();
    lock.waitLock(400000);
    spreadNames = spreadNames || 'ReadQueryData';
    this.spreadSheet.getSheetByName(spreadNames)
    .getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    lock.releaseLock();
    return this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
  }

  getSummaryIdMap(spreadNames, startRow){
    spreadNames = spreadNames || 'SummaryId';
    startRow = startRow || 1;
    let summaryMap = new Map();
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(data[i][0].toString().replaceAll(" ", "") != "" && data[i][3].toString().replaceAll(" ", "") != ""){
        summaryMap[parseInt(data[i][0])] = new summaryID(parseInt(data[i][0]), data[i][1].toUpperCase(), 
        data[i][2].toUpperCase(), data[i][3].toString().toUpperCase(), parseInt(data[i][4]), data[i][5]);
      }
    }
    return summaryMap;
  }

  getSummaryIdList(spreadNames, startRow){
    spreadNames = spreadNames || 'SummaryId';
    startRow = startRow || 1;
    let summaryList = [];
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();

    for(let i = startRow; i < data.length; i++){
      if(data[i][0].toString().replaceAll(" ", "") != "" && data[i][3].toString().replaceAll(" ", "") != ""){
        summaryList.push(new summaryID(parseInt(data[i][0]), data[i][1].toUpperCase(), 
        data[i][2].toUpperCase(), data[i][3].toString().toUpperCase(), parseInt(data[i][4]), data[i][5]));
      }
    }
    return summaryList;
  }

  getUserId(userId, spreadNames){
    spreadNames = spreadNames || 'UsersId';
    try{
      let user = this.queryId(
          '=QUERY(' + spreadNames + '!A1:E, "Select A, B, C, D, E where A = \'' + userId.toUpperCase() + '\'",1)'
        )[1];
      return new userID(user[0].toUpperCase(), user[1], user[2], user[3]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

  getPaymentID(payId, spreadNames){
    spreadNames = spreadNames || 'PaymentId';
    try{
      let pay = this.queryId(
          '=QUERY(' + spreadNames + '!A1:E, "Select A, B, C, D, E where A = \'' + payId.toUpperCase() + '\'",1)'
        )[1];
      return new paymentID(pay[0].toUpperCase(), pay[1], pay[2], pay[3]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

  gettripsID(tripId, spreadNames){
    spreadNames = spreadNames || 'TripsId';
    try{
      let trip = this.queryId(
          '=QUERY(' + spreadNames + '!A1:E, "Select A, B, C, D, E where A = \'' + tripId.toUpperCase() + '\'",1)'
        )[1];
      return new paymentID(trip[0].toUpperCase(), trip[1], trip[2], trip[3]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

  getTransID(transId, spreadNames){
    spreadNames = spreadNames || 'AccountTransactionId';
    try{
      let trans = this.queryId(
          '=QUERY(' + spreadNames + '!A1:E, "Select A, B, C, D, E where A = \'' + transId.toUpperCase() + '\'",1)'
        )[1];
      return new transactionID(trans[0].toUpperCase(), trans[3], trans[1], trans[2], trans[4]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

  getAccountID(accId, spreadNames){
    spreadNames = spreadNames || 'AccountId';
    try{
      let acc = this.queryId(
          '=QUERY(' + spreadNames + '!A1:E, "Select A, B, C, D, E where A = \'' + accId.toUpperCase() + '\'",1)'
        )[1];
      return new accountID(acc[0].toUpperCase(), acc[1], acc[2], acc[3]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

  getMessageId(msgId){
    try{
      let msg = this.queryId(
          '=QUERY(MessageId!A1:E, "Select A, B, C, D, E where A = \'' + msgId.toUpperCase() + '\'",1)'
        )[1];
      return new messageID(msg[0].toUpperCase(), msg[1], msg[2], msg[3]);
    }catch(e){
      console.log(e);
      return undefined;
    }
  }

}
