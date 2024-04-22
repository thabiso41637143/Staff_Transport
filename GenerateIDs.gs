
/**
 * 
 */
class summaryID{
  constructor(summId, group, category, sequence, numbIds, comments, spreadSheetName, spreadSheetId){
    this.summaryId = summId;
    this.group = group;
    this.category = category;
    this.sequence = sequence;
    this.numbIds = parseInt(numbIds);
    this.comments = comments;
    this.spreadSheetName = spreadSheetName || 'SummaryId';
    this.spreadSheetId = spreadSheetId || '18kBtVorjQewTZMKGAx2Jw-So5wNf0Whu756S3pjnY7E';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  getSummaryIdList(){
    return [this.summaryId, this.group, this.category,
      this.sequence, this.numbIds, this.comments];
  }

  getSummaryIdMap(rowHeading){
    rowHeading = rowHeading || 0;
    let heading = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    let summMap = new Map();
    for(let i in this.getSummaryIdList()){
      summMap[heading[i]] = this.getSummaryIdList()[i];
    }

    return summMap;
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.summaryId){
        return i;
      }
    }
    return -1;
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateNumbIds(col){
    col = col || 5;
    return this.updateSpreadSheetCell(this.getRowNumber() + 1, col, this.numbIds, 
    'Successfully updated number of Ids');
  }

  checkId(query, spName){
    spName = spName || 'ReadQueryData';
    return this.getQueryData(query, spName).length > 1;
  }

  getQueryData(query, spName){
    spName = spName || 'ReadQueryData';
    this.spreadSheet.getSheetByName(spName)
    .getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
  }

  getUserIDMap(startRow, spName){
    spName = spName || 'UsersId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let usId = new Map();
    for(let i = startRow; i < data.length; i++){
      usId[data[i][0].toUpperCase()] = new userID(data[i][0].toUpperCase(), data[i][1],
      data[i][2]);
    }
    return usId;
  }
  getMessageId(msgId, spName){
    spName = spName || 'MessageId';
    let msg = this.getQueryData(
      '=QUERY(MessageId!A1:E, "Select A, B, C, D, E where A = \'' + msgId + '\'",1)'
      )[1];
    return new new messageID(msg[0].toUpperCase(), msg[1], msg[2], msg[3]);
  }

  getMessageIDMap(startRow, spName){
    spName = spName || 'MessageId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let msgId = new Map();
    for(let i = startRow; i < data.length; i++){
      msgId[data[i][0].toUpperCase()] = new messageID(data[i][0].toUpperCase(), data[i][1],
      data[i][2]);
    }
    return msgId;
  }

  createUserId(summaryId){
    try{
      this.numbIds++;
      let newId = (this.sequence + (1000 + this.numbIds).toString()).toUpperCase();
      this.updateNumbIds();
      //check if the id exist
      if(this.checkId('=QUERY(UsersId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.createUserId();
      }
      let userId = new userID(newId, this.category, 'Free');
      console.log(userId.userId.addNewId());
      let idTr = new idTracker();
      summaryId = summaryId || 208;
      let acc = idTr.getSummaryIdMap()[summaryId].createAccountId(newId);
      return [userId, acc];
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }

  getTripIdMap(startRow, spName){
    spName = spName || 'TripsId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let tripMap = new Map();
    for(let i = startRow; i < data.length; i++){
      tripMap[data[i][0].toUpperCase()] = new tripsID(data[i][0].toUpperCase(), data[i][1],
      data[i][2]);
    }
    return tripMap;
  }

  createTripId(){
    try{
      this.numbIds++;
      let newId = (this.sequence + this.numbIds.toString()).toUpperCase();
      this.updateNumbIds();
      //check if the id exist
      if(this.checkId('=QUERY(TripsId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.createTripId();
      }
      let tripId = new tripsID(newId, this.category, 'Free');
      console.log(tripId.tripId.addNewId());
      return tripId;
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }

  getPaymentID(startRow, spName){
    spName = spName || 'PaymentId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let pymId = new Map();
    for(let i = startRow; i < data.length; i++){
      pymId[data[i][0].toUpperCase()] = new paymentID(data[i][0].toUpperCase(), data[i][1],
      data[i][2]);
    }
    return pymId;
  }

  cretatePaymentId(){
    try{
      this.numbIds++;
      let newId = (this.sequence + this.numbIds.toString()).toUpperCase();
      console.log(this.updateNumbIds());
      //check if the id exist
      if(this.checkId('=QUERY(PaymentId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.cretatePaymentId();
      }
      let paymentId = new paymentID((this.sequence + this.numbIds.toString()).toUpperCase(),
      this.category, 'Free');
      console.log(paymentId.paymentId.addNewId());
      return paymentId;
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }

  getAccountID(startRow, spName){
    spName = spName || 'AccountId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let accId = new Map();
    for(let i = startRow; i < data.length; i++){
      accId[data[i][0].toString().toUpperCase()] = new accountID(data[i][0].toString().toUpperCase(), data[i][1],
      data[i][2], data[i][3]);
    }
    return accId;
  }

  createAccountId(userId){
    try{
      this.numbIds++;
      let newId = (parseInt(this.sequence) + this.numbIds).toString().toUpperCase();
      console.log(this.updateNumbIds());
      //check if the id exist
      if(this.checkId('=QUERY(AccountId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.createAccountId(userId);
      }
      let accountId = new accountID(newId, this.category, 'Free', userId);
      console.log(accountId.addNewAccount());
      return accountId;
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }

  getTracnsactionID(startRow, spName){
    spName = spName || 'AccountTransactionId';
    startRow = startRow || 1;
    let data = this.spreadSheet.getSheetByName(spName)
    .getDataRange().getValues();
    let transId = new Map();
    for(let i = startRow; i < data.length; i++){
      transId[data[i][0].toString().toUpperCase()] = new transactionID(data[i][0].toString().toUpperCase(), data[i][3],
      data[i][1], data[i][2]);
    }
    return transId;
  }

  createTransactionId(accNumb){
    try{
      this.numbIds++;
      let newId = this.sequence.toString().toUpperCase() + this.numbIds.toString().toUpperCase();
      console.log(this.updateNumbIds());
      //check if the id exist
      if(this.checkId('=QUERY(AccountTransactionId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.createTransactionId(accNumb);
      }
      let transId = new transactionID(newId, accNumb, this.category, 'Free');
      console.log(transId.addNewTransaction());
      return transId;
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }

  createMessageId(){
    try{
      this.numbIds++;
      let newId = (this.sequence + (1000 + this.numbIds).toString()).toUpperCase();
      this.updateNumbIds();
      //check if the id exist
      if(this.checkId('=QUERY(MessageId!A1:E, "Select A, B, C, D, E where A = \'' + newId + '\'",1)')){
        return this.createMessageId(msgNumb);
      }
      let msgId = new messageID(newId, this.category, 'Free');
      console.log(msgId.messageId.addNewId());
      return msgId;
    }catch(e){
      console.error(e);
      return "An error occured while trying to change the number of Ids to "+ this.numbIds;
    }
  }
}

/**
 * 
 */
class accountID{
  constructor(id, group, status, userId, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'AccountId';
    this.comments = comm || '';
    this.userId = userId;
    this.accId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
  }

  addNewAccount(col){
    try{
      col = col || 4;
      console.log(this.accId.addNewId());
      this.accId.spreadSheetData.getRange(this.accId.getRowNumber() + 1, col).setValue(this.userId);
      console.log('Linked the user id '+ this.userId + ', to account number: '+ this.accId.generatedId);
      return this.accId.generatedId;
    }catch(e){
      console.error(e);
      return -1;
    }
  }

  getAccountIdList(){
    let accList = this.accId.getGeneratedIDList();
    accList.push(this.comments);
    return accList;
  }
}

/**
 * 
 */
class transactionID{
  constructor(id, accNumb, group, status, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'AccountTransactionId';
    this.comments = comm || '';
    this.tranId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
    this.accNumber = accNumb;
  }

  addNewTransaction(col){
    try{
      col = col || 4;
      console.log(this.tranId.addNewId());
      this.tranId.spreadSheetData.getRange(this.tranId.getRowNumber() + 1, col).setValue(this.accNumber);
      console.log('Linked the Account Number to '+ this.accNumber + ', to Transaction Number: '+ this.tranId.generatedId);
      return this.tranId.generatedId;
    }catch(e){
      console.error(e);
      return -1;
    }
  }

  getTransactionList(){
    let transList = this.tranId.getGeneratedIDList();
    transList.push(this.accNumber);
    transList.push(this.comments);
    return transList;
  }
}
/**
 * 
 */
class userID{
  constructor(id, group, status, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'UsersId';
    this.comments = comm || '';
    this.userId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
  }

  getUserIdList(){
    let userList = this.userId.getGeneratedIDList();
    userList.push(this.comments);
    return userList;
  }

}

/**
 * 
 */
class tripsID{
  constructor(id, group, status, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'TripsId';
    this.comments = comm || '';
    this.tripId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
  }

  getTripIdList(){
    let tripList = this.tripId.getGeneratedIDList();
    tripList.push(this.comments);
    return tripList;
  }

}

/**
 * 
 */
class paymentID{
  constructor(id, group, status, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'PaymentId';
    this.comments = comm || '';
    this.paymentId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
  }

  getPaymentList(){
    let payList = this.paymentId.getGeneratedIDList();
    payList.push(this.comments);
    return payList;
  }
}

/**
 * 
 */
class messageID{
  constructor(id, group, status, comm, spreadSheetName, spreadSheetId){
    this.spreadSheetName = spreadSheetName || 'MessageId';
    this.comments = comm || '';
    this.messageId = new generatedIDs(id, group, status, this.spreadSheetName, spreadSheetId);
  }

  getMsgDetailList(){
    let msgList = this.messageId.getGeneratedIDList();
    msgList.push(this.comments);
    return msgList;
  }
}

/**
 * 
 */
class generatedIDs{
  constructor(id, group, status, spreadSheetName, spreadSheetId){
    this.generatedId = id;
    this.groupId = group;
    this.status = status;
    this.spreadSheetId = spreadSheetId || '18kBtVorjQewTZMKGAx2Jw-So5wNf0Whu756S3pjnY7E';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(spreadSheetName);
  }

  addNewId(){
    this.spreadSheetData.appendRow(this.getGeneratedIDList());
    SpreadsheetApp.flush();
    console.log('Successfully created new id with the following details:\n' + this.getGeneratedIDList());
    return this.generatedId.toUpperCase();
  }
  getGeneratedIDList(){
    return [this.generatedId.toUpperCase(), this.groupId, this.status];
  }
  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.generatedId){
        return i;
      }
    }
    return -1;
  }

  removeId(rowNumb){
    rowNumb = rowNumb || this.getRowNumber() + 1;
    this.spreadSheetData.deleteRow(rowNumb);
    SpreadsheetApp.flush();
    return 'Successfull deleted ID with the following details\n ' 
    + this.getGeneratedIDList() + '\n Row number: ' + rowNumb;
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateStatus(status, col){
    try{
      col = col || 3;
      return this.updateSpreadSheetCell(this.getRowNumber() + 1, col, status,
          'Successfully updated status for ID: ' + this.generatedId + ' to: '+ status);
    }catch(e){
      console.error(e);
      return 'Failed to update status for ID: ' + this.generatedId + ' to: '+ status;
    }
  }
}
