class staffGroup {
  constructor(groupId, groupDescr, amount, comments, spreadSheetId, spreadSheetName){
    this.groupId = groupId;
    this.groupDescription = groupDescr;
    this.amount = amount;
    this.comments = comments;

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'StaffGroups';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber] == this.groupId){
        return i;
      }
    }
    return -1;
  }

  getGroupList(){
    return [this.groupId, this.groupDescription, this.amount, this.comments];
  }

  getGroupDetails(rowHeading){
    rowHeading = rowHeading || 0;
    let groupMap = new Map();
    let headingData = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    for(let i = 0; i < this.getGroupList().length; i++){
      groupMap[headingData[i]] = this.getGroupList()[i];
    }
    return groupMap;
  }
}
