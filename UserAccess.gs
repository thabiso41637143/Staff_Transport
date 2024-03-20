class userAccess{
  constructor(spreadSheetId, spreadSheetName){

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'AccessControl';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName);   
  }

  getAccessControlMap(){
    let accMap = new Map();
    let accData = this.spreadSheetData.getDataRange().getValues();
    let accHeadings = accData[0].slice(2, accData[0].length);
    
    for(let i = 1; i < accData.length; i++){
      let accG = new Map();
      for(let g = 0; g < accHeadings.length; g++){
        accG[accHeadings[g]] = accData[i][g + 2];
      }
      accMap[accData[i][0]] = new accessControl(accData[i][0], accData[i][1], accG);
    }

    return accMap;
  }
  
}

/**
 * 
 */
class accessControl{
  constructor(userId, level, accessGroup, spreadSheetId, spreadSheetName){
    this.userId = userId;
    this.level = level;
    this.accessGroup = accessGroup;

    this.spreadSheetId = spreadSheetId ||'1Xsh3_Z_BvmSJw11CN_8PAXf1x-QPflEHTlN7jX2WXTA';
    this.spreadSheetName = spreadSheetName || 'AccessControl';
    this.spreadSheetData = SpreadsheetApp
    .openById(this.spreadSheetId)
    .getSheetByName(this.spreadSheetName); 
  }

  checkAcceess(access){
    return this.accessGroup[access];
  }

  getGroupAcceess(){
    let allGroup = new transportDatabaseSheet();
    let groups = Object.values(allGroup.getGroupMap());
    let accGroup = new Map();
    for(let g in groups){
      if(this.accessGroup[groups[g].groupDescription])
        accGroup[groups[g].groupId] = groups[g];
    }
    return accGroup;    
  }

  getPassengerAccess(){
    
  }
}
