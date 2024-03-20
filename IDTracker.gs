class idTracker {
  constructor(spreadSheetId){
    this.spreadSheetId = spreadSheetId || '18kBtVorjQewTZMKGAx2Jw-So5wNf0Whu756S3pjnY7E';
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
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

  getUserId(userId, spreadNames, startRow){
    spreadNames = spreadNames || 'UsersId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(userId.toUpperCase() == data[i][0].toUpperCase()){
        return new userID(data[i][0].toUpperCase(), data[i][1], data[i][2]);
      }
    }
    return undefined;
  }

  getPaymentID(payId, spreadNames, startRow){
    spreadNames = spreadNames || 'PaymentId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(payId.toUpperCase() == data[i][0].toUpperCase()){
        return new paymentID(data[i][0].toUpperCase(), data[i][1], data[i][2]);
      }
    }
    return undefined;
  }

  gettripsID(tripId, spreadNames, startRow){
    spreadNames = spreadNames || 'TripsId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(tripId.toUpperCase() == data[i][0].toUpperCase()){
        return new tripsID(data[i][0].toUpperCase(), data[i][1], data[i][2]);
      }
    }
    return undefined;
  }

  getTransID(transId, spreadNames, startRow){
    spreadNames = spreadNames || 'AccountTransactionId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(transId.toUpperCase() == data[i][0].toUpperCase()){
        return new transactionID(data[i][0].toString().toUpperCase(), data[i][3],
        data[i][1], data[i][2]);
      }
    }
    return undefined;
  }

  getAccountID(accId, spreadNames, startRow){
    spreadNames = spreadNames || 'AccountId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(accId == data[i][0]){
        return new accountID(data[i][0], data[i][1],
          data[i][2], data[i][3]);
      }
    }
    return undefined; 
  }

  getMessageId(msgId, spreadNames, startRow){
    spreadNames = spreadNames || 'MessageId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spreadNames)
    .getDataRange().getValues();
    for(let i = startRow; i < data.length; i++){
      if(msgId.toUpperCase() == data[i][0].toUpperCase()){
        return new messageID(data[i][0].toUpperCase(), data[i][1], data[i][2]);
      }
    }
    return undefined;
  }
}
