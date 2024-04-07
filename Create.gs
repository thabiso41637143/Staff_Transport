class folderStructure {
  constructor(mFolderId, folderName, spreadSheetName, spreadSheetId){
    this.mainFolderId = mFolderId || '1O1WFKmKO0HhrnAH8dHUNluxLXBDAOCgv';
    this.folderName = folderName || generalFunctions.formatDate();
    this.folder = ABSALUMINUM.getFolder(this.mainFolderId, this.folderName);
    this.spreadSheetName = spreadSheetName || 'FolderStructures';
    this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
    this.folderList;
  }

  createFolder(){
    this.folder.createFolder();
    this.folderList = this.folder.getFolderList();
    this.spreadSheetData.appendRow(this.folder.getFolderList());
  }

  getFolderListDetails(){
    return this.folderList;
  }
  
}
