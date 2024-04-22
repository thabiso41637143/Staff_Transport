class messages{
  constructor(msgSummaryId, spreadSheetName, spreadSheetId){
    this.spreadSheetId = spreadSheetId ||'1C01njtZcPB9rwdqZCXBg0flCWBA2sbK8_eFHQ-xJmg8';
    this.spreadSheetName = spreadSheetName || 'AttendanceAlert';
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
    this.spreadSheetData = this.spreadSheet
    .getSheetByName(this.spreadSheetName);
    msgSummaryId = msgSummaryId || 213;
    this.idTracker = new idTracker();
    this.msgIdTracker = this.idTracker.getSummaryIdMap()[msgSummaryId];
  }

  /**
   * 
   */
  getAllAttMsg(){
    let attMsg = new Map();
    let data = this.spreadSheetData.getDataRange()
    .getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][0] != ''){
        attMsg[data[i][0]] = new attendance(data[i][0], data[i][1], data[i][2],
        data[i][3], data[i][4], data[i][5], data[i][6]);
      }
    }
    return attMsg;
  }

  /**
   * 
   */
  getAttSendToMsg(userId, status){
    status = status || 'Read';
    let msgList = Object.values(this.getAllAttMsg());
    let userMsg = new Map();
    for(let i = 0; i < msgList.length; i++){
      if(userId.toString().toUpperCase() == msgList[i].sendTo.toString().toUpperCase()
      && msgList[i].status == 'Unread'){
        userMsg[msgList[i].messageId] = msgList[i].getMessageMap()['Message'];
        msgList[i].updateStatus(status);
      }
    }
    return userMsg;
  }

  /**
   * 
   */
  queryAttMsg(userId, status, query, spName){
    query = query || 
    '=QUERY(AttendanceAlert!A:G, "Select A, B, C, D, E, F, G Where C = \''+ userId.toUpperCase() +'\' and LOWER(F) = \''+ status.toLowerCase() + '\'", 1)';
    spName = spName || 'Query_Alert';
    this.spreadSheet.getSheetByName(spName).getRange('A1').setValue(query);
    SpreadsheetApp.flush();
    return this.spreadSheet.getSheetByName(spName).getDataRange().getValues();
  }
  
  /**
   * @return attendance list objects
   */
  getAttMsgList(userId, status){
    status = status || 'Read';
    let data = this.queryAttMsg(userId, status);
    let attList = [];
    for(let i = 1; i < data.length; i++){
      attList.push(new attendance(data[i][0], data[i][1], data[i][2],
        data[i][3], data[i][4], data[i][5], data[i][6]));
    }
    return attList;
  }

  /**
   * 
   */
  addNewAttMsg(fromId, sendTo, date, msg,status, com){
    com = com || '';
    let msgId = this.msgIdTracker.createMessageId().messageId.generatedId;
    let message = new attendance(msgId, fromId, sendTo, date, msg,status, com);
    return message.addMessage();
  }

  /**
   * 
   */
  addNewReports(userId,	messageDescrip){
    let repId = this.msgIdTracker.createMessageId().messageId.generatedId;
    let capNewRep = new captureReports(repId, userId, messageDescrip, 'unprocessed', '', new Date());
    return capNewRep.addReport();
  }
}


class attendance{
  constructor(messageId,fromId, sendTo, date, msg,status, com, spreadSheetId, spreadSheetName){
    this.comments = com;
    this.status = status;
    this.message = msg;
    this.fromId = fromId;
    this.sendTo = sendTo;
    this.date = Utilities.formatDate(new Date(date), 'GMT+0200', 'd MMMM yyyy');
    this.messageId = messageId;
    this.spreadSheetId = spreadSheetId ||'1C01njtZcPB9rwdqZCXBg0flCWBA2sbK8_eFHQ-xJmg8';
    this.spreadSheetName = spreadSheetName || 'AttendanceAlert';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);
  }

  /**
   * 
   */
  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.messageId){
        return i;
      }
    }
    return -1;
  }

  /**
   * 
   */
  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  /*
  */
  getMessageList(){
    return [this.messageId, this.fromId, this.sendTo, this.date, 
        this.message, this.status, this.comments];
  }

  /*
  */
  getMessageMap(rowHeading){
    rowHeading = rowHeading || 0;
    let msgMap = new Map();
    let headingData = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    for(let i = 0; i < this.getMessageList().length; i++){
      msgMap[headingData[i]] = this.getMessageList()[i];
    }
    return msgMap;
  }

  /**
   * 
   */
  deleteMsg(){
    this.spreadSheetData.deleteRow(this.getRowNumber() + 1);
  }
  /*
  */
  addMessage(){
    try{
      this.spreadSheetData.appendRow(this.getMessageList());
      SpreadsheetApp.flush();
      console.log(['Successfully added new message to the alert message', this.getMessageList()]);
      return 'Successfully added new message to the alert message';
    }catch(e){
      console.error(["Failed to add new message.", this.getMessageList(), e]);
      return ["Failed to add new message.", this.getMessageList(), e];
    }
  }

  /**
   * 
   */
  updateStatus(st, col){
    try{
      col = col || 6;
      return this.updateSpreadSheetCell(this.getRowNumber() + 1, col, st,
            'Status updated to '+ st);
    }catch(e){
      console.log(["Failed to update the status to " + st, e]);
      return ["Failed to update the status to " + st, e];
    }
  }

  /**
   * 
   */
  updateMessage(msg, col){
    try{
      col = col || 5;
      return this.updateSpreadSheetCell(this.getRowNumber() + 1, col, msg,
            'Message updated to\n'+ msg);
    }catch(e){
      console.log(["Failed to update the message to " + msg, e]);
      return ["Failed to update the message to " + msg, e];
    }
  }

  /**
   * 
   */
  printMsg(){
    return 'Date: '+ this.date + '\n\nMessage Details:\n'+this.message + '\n';
  }
}

/**
 * 
 */
class captureReports{
  constructor(messageId,	userId,	messageDescrip,	status,	comments, dateCaptured, spreadSheetId, spreadSheetName){

    this.messageId = messageId;
    this.dateCaptured = Utilities.formatDate(new Date(dateCaptured), 'GMT+0200', 'd MMMM yyyy, HH:mm:ss') || 
    Utilities.formatDate(new Date(), 'GMT+0200', 'd MMMM yyyy, HH:mm:ss');
    this.userId = userId;
    this.messageDescrip = messageDescrip;
    this.status = status;
    this.comments = comments;
    this.spreadSheetId = spreadSheetId ||'1C01njtZcPB9rwdqZCXBg0flCWBA2sbK8_eFHQ-xJmg8';
    this.spreadSheetName = spreadSheetName || 'CaptureReports';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);
  }

  getReportList(){
    return [this.messageId, this.dateCaptured, this.userId,
    this.messageDescrip, this.status, this.comments];
  }

  addReport(){
    this.spreadSheetData.appendRow(this.getReportList());
    return ['successfully captured the new report', this.getReportList()];
  }

  /**
   * 
   */
  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.messageId){
        return i;
      }
    }
    return -1;
  }

  updateReport(){

  }

  getReportMap(rowHeading){
    rowHeading = rowHeading || 0;
    let repMap = new Map();
    let headingData = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    for(let i = 0; i < this.getMessageList().length; i++){
      repMap[headingData[i]] = this.getReportList()[i];
    }
    return repMap;
  }

  /**
   * 
   */
  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateStatus(st, r, c){
    r = r || this.getRowNumber() + 1;
    c = c || 5;
    return this.updateSpreadSheetCell(r, c, st, 
    'Successfully update the status report to '+ st);
  }
}