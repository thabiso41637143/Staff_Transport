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
    this.newFolder = undefined;
  }

  /**
   * 
   */
  checkFolder(){
    let datCol = new collectionDatabase();
    return datCol.checkTransQuerySet(
      '=QUERY(FolderStructures!A:H,"Select A, B, C, D, E Where LOWER(B) contains \'' + 
      this.folderName.toLowerCase() + '\' and C = \'' + this.mainFolderId + '\'",1)',  'QuerySet'
    );
  }

  /**
   * 
   */
  createFolder(){
    if(!this.checkFolder()){
      this.newFolder  = this.folder.createFolder();
      this.spreadSheetData.appendRow(this.folder.getFolderList());
      return 'Created the folder';
    }
    return 'The folder already exist.';
  }

  /**
   * 
   */
  getFolder(spName){
    if(this.checkFolder()){
      spName = spName || 'QuerySet';
      let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues()[1];
      return new folder(data[0], data[1], data[2], data[3], data[4]);
    }else{
      console.info(this.createFolder());
      return this.getFolder();
    }
  }

  /**
   * 
   */
  getFolderListDetails(){
    if(this.newFolder == undefined)
      this.createFolder();
    return this.newFolder.getFolderList();
  }
}

/**
 * 
 */
class createFiles{
  constructor(tempId, folder, fileName, type, spreadSheetName, spreadSheetId){
    this.tempId = tempId;
    this.fileType = type;
    this.folder = folder || DriveApp.getFolderById('1O1WFKmKO0HhrnAH8dHUNluxLXBDAOCgv');
    this.fileName = fileName || 'New Document';
    this.newFile = ABSALUMINUM.getFile(this.tempId, this.folder, this.fileType, this.fileName);
    this.spreadSheetName = spreadSheetName || 'CreatedFiles';
    this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  checkFile(){
    let datCol = new collectionDatabase();
    return datCol.checkTransQuerySet(
      '=QUERY(CreatedFiles!A:H,"Select A, B, C, D, E, F, G Where LOWER(B) contains \'' + this.fileName.toLowerCase() + 
      '\' and D = \'' + this.folder.getId() + '\' and LOWER(F) contains \'' + this.fileType.toLowerCase() + '\'",1)'
    );
  }

  createFile(){
    if(!this.checkFile()){
        let fileDetails = this.newFile.creatFile();
        this.spreadSheetData.appendRow(fileDetails.fileDetailsList);
        return 'Successfully created the file with the following details: \n'+ fileDetails.fileDetailsList;
    }
    return 'The file already exist.'
  }

  getFile(spName){
    if(this.checkFile()){
      spName = spName || 'QuerySet';
      let data = this.spreadSheet.getSheetByName(spName).getDataRange().getValues()[1];
      return new file(data[0], data[1], data[2], data[3], data[4], data[5], data[6]);
    }else{
      console.info(this.createFile());
      return this.getFile();
    }
  }
}

/**
 * 
 */
class folder{
  constructor(newFolderId, newFolderName, mainFolderId, mainFolderName, comm, spreadSheetName, spreadSheetId){

    this.newFolderId = newFolderId;
    this.newFolderName = newFolderName;
    this.mainFolderId = mainFolderId;
    this.mainFolderName = mainFolderName;
    this.comments = comm || '';
    this.spreadSheetName = spreadSheetName || 'FolderStructures';
    this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  getFolderRow(){
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][0] == this.newFolderId){
        return i;
      }
    }
    return -1;
  }

  getFolder(){
    if(this.getFolderRow() > 0){
      return DriveApp.getFolderById(this.newFolderId);
    }
    return undefined;
  }
}


/**
 * 
 */
class file{
  constructor(newFileId, newFileName, tempId, folderId, folderName, fileType, comm, spreadSheetName, spreadSheetId){
    this.newFileId = newFileId;
    this.newFileName = newFileName;
    this.templateId = tempId;
    this.folderId = folderId;
    this.folderName = folderName;
    this.fileType = fileType;
    this.comments = comm || '';
    this.spreadSheetName = spreadSheetName || 'CreatedFiles';
    this.spreadSheetId = spreadSheetId || '1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetData = SpreadsheetApp.openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName);
    this.spreadSheet = SpreadsheetApp.openById(this.spreadSheetId);
  }

  /**
   * 
   */
  getRowNumber(){
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 1; i < data.length; i++){
      if(data[i][0] == this.newFileId){
        return i;
      }
    }
    return -1;
  }

  getFileDetailsList(){
    return [this.folderId, this.folderName, this.newFileId, this.newFileName, this.fileType, this.comments];
  }

  /**
   * 
   */
  getNewFile(){
    if(this.fileType.toLowerCase() == 'document'){
      return DocumentApp.openById(this.newFileId);
    }
    else if(this.fileType.toLowerCase() == 'spreadsheet'){
      return SpreadsheetApp.openById(this.newFileId);
    }
    else if(this.fileType.toLowerCase() == 'powerpoint'){
      return SlidesApp.openById(this.newFileId);
    }
    else{
      return undefined;
    }
  }

}

