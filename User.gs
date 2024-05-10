/**
 * 
 */
class userDetails{
  constructor(userId, fullNames, contacts, userType, homeLocation, collectionLocation, email, groupId, comments, spreadSheetId, spreadSheetName){
    this.userId = userId;
    this.userFullNames = fullNames;
    this.contactNumbers = contacts;
    this.userType = userType;
    this.userHomeLocation = homeLocation;
    this.userCollectionLocation = collectionLocation;
    this.email = email;
    this.groupID = groupId;
    this.comments = comments;
    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'Users';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);
  }

  /**
   * 
   */
  login(id, type){
    return (this.userId.toUpperCase() == id.toUpperCase()) && (this.userType.toUpperCase() == type.toUpperCase());
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.userId){
        return i;
      }
    }
    return -1;
  }

  getCustList(){
    return [this.userId, this.userFullNames, this.contactNumbers, 
    this.userType, this.userHomeLocation, this.userCollectionLocation, this.email, this.groupID,
    this.comments];
  }

  getCustDetails(rowHeading){
    rowHeading = rowHeading || 0;
    let custMap = new Map();
    let headingData = this.spreadSheetData.getDataRange()
    .getValues()[rowHeading];
    for(let i = 0; i < this.getCustList().length; i++){
      custMap[headingData[i]] = this.getCustList()[i];
    }
    return custMap;
  }

  getCustDetailJson(){
    return JSON.stringify(this.getCustDetails());
  }

  setEmail(mail, col){
    try{
      col = col || 7;
      this.updateSheet(col, mail);
      this.email = mail;
      return 'Successfull updated email address to '+ mail;
    }catch(e){
      console.error(e);
      return "Failed to update email address to "+ mail;
    }
  }

  setGroupId(gId, col){
    try{
      col = col || 8;
      this.updateSheet(col, gId);
      this.groupID = gId;
      return 'Successfull updated group Id to '+ gId;
    }catch(e){
      console.error(e);
      return "Failed to update group Id to "+ gId;
    }
  }
  
  setFullName(fn, col){
    try{
      col = col || 2;
      this.updateSheet(col, fn);
      this.userFullNames = fn;
      return 'Successfull updated the full name to '+ fn;
    }catch(e){
      console.error(e);
      return "Failed to update the full name to "+ fn;
    }
  }

  setContact(cont, col){
    try{
      col = col || 3;
      this.updateSheet(col, cont);
      this.contactNumbers = cont;
      return 'Successfull updated the Contact Numbers to '+ cont;
    }catch(e){
      console.error(e);
      return 'failed to updated the Contact Numbers to '+ cont;
    }
  }

  setType(type, col){
    try{
      col = col || 4;
      this.updateSheet(col, type);
      this.userType = type;
      return 'Successfull updated user type to '+ type;
    }catch(e){
      console.error(e);
      return 'Failed to updated user type to '+ type
    }
  }

  setHomeLocation(hloc, col){
    try{
      col = col || 5;
      this.updateSheet(col, hloc);
      this.userHomeLocation = hloc;
      return 'Successfull updated the home loction to '+ hloc;
    }catch(e){
      console.error(e);
      return 'Failed to updated the home loction to '+ hloc;
    }
  }

  setWorkLocation(wloc, col){
    try{
      col = col || 6;
      this.updateSheet(col, wloc);
      this.userCollectionLocation = wloc;
      return 'Successfull updated the work location to '+ wloc;
    }catch(e){
      console.error(e);
      return 'Failed to updated the work location to '+ wloc;
    }
  }

  updateSheet(col, data){
      this.spreadSheetData.getRange(this.getRowNumber() + 1, col)
      .setValue(data);
      SpreadsheetApp.flush();
  }
}
