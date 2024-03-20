class captureTrips {
  constructor(tripId, userId, tripAmount, tripDate, fromLocation, toLocation, status, driverId,comm,
   spreadSheetId, spreadSheetName){
    this.userId = userId;
    this.tripId = tripId;
    this.amount = tripAmount;
    this.date = tripDate;
    this.fromLocation = fromLocation;
    this.toLocation = toLocation;
    this.status = status;
    this.driveId = driverId;
    this.comments = comm;

    this.spreadSheetId = spreadSheetId ||'1-cVWfZgB1vRWT25P636wgCc-y-Zj3MWTkZSZ8cgqhDw';
    this.spreadSheetName = spreadSheetName || 'CaptureTrip';
    this.spreadSheetData = SpreadsheetApp
      .openById(this.spreadSheetId)
      .getSheetByName(this.spreadSheetName); 
  }

  getRowNumber(colNumber){
    colNumber = colNumber || 0;
    let data = this.spreadSheetData.getDataRange().getValues();
    for(let i = 0; i < data.length; i++){
      if(data[i][colNumber].toString().toUpperCase() == this.tripId){
        return i;
      }
    }
    return -1;
  }

  getCaptureTripsList(){
    return [this.tripId, this.userId, parseFloat(this.amount).toFixed(2), Utilities.formatDate(this.date, 'GMT+0200', 'd MMMM yyyy'),
     this.fromLocation, this.toLocation, this.status, this.driveId];
  }

  getCaptureTripMap(rowHeading, header){
    rowHeading = rowHeading || 0;
    header = header || this.spreadSheetData.getDataRange().getValues()[rowHeading];
    let tripCaptureMap = new Map();
    for(let i = 0; i < this.getCaptureTripsList().length; i++){
      tripCaptureMap[header[i].toLowerCase()] = this.getCaptureTripsList()[i];
    }
    return tripCaptureMap;
  }

  getCaptureTripJSON(){
    return JSON.stringify(this.getCaptureTripMap());
  }

  updateSpreadSheetCell(r, c, value, msg){
    this.spreadSheetData.getRange(r, c).setValue(value);
    SpreadsheetApp.flush();
    return msg;
  }

  updateStatus(stat, col){
    col = col || 7;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, stat,
      'Succesfully updated trip status to ' + stat);
      this.status = stat;
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured during update of status: '+ stat;
    }
  }

  updateDriver(newDrive, col){
    col = col || 8;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, newDrive,
      'Succesfully updated new Driver Id to ' + newDrive);
      this.driveId = newDrive;
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured during update of driver ID to: '+ newDrive;
    }
  }

  updateUserId(id, col){
    col = col || 2;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, id.toUpperCase(),
      'Succesfully updated trip user Id to ' + id.toUpperCase());
      this.userId = id.toUpperCase();
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update user id to '+ id.toUpperCase();
    }
  }

  updateAmount(amt, col){
    col = col || 3;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, parseFloat(amt).toFixed(2),
      'Succesfully updated trip amount to R' + parseFloat(amt).toFixed(2));
      this.amount = parseFloat(amt);
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update trip Amount to R'+ amt;
    }
  }

  updateDate(d, col){
    try{
      col = col || 4;
      let resp = 'Failed to add new trip because the date is not valid:'+ d;
      if(new Date(d) != 'Invalid Date'){
        resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, 
          Utilities.formatDate(new Date(d), 'GMT+0200', 'd MMMM yyyy'),
          'Succesfully updated trip date to ' + d);
        this.date = new Date(d);
      }
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update trip date to '+ d;
    }
  }

  updateFromLoc(fromLoc, col){
    col = col || 5;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, fromLoc,
      'Succesfully updated trip from location to ' + fromLoc);
      this.fromLocation = fromLoc;
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update the from location to '+ fromLoc;
    }
  }

  updateToLoc(toLoc, col){
    col = col || 6;
    try{
      let resp =  this.updateSpreadSheetCell(this.getRowNumber() + 1, col, toLoc,
      'Succesfully updated trip to location to ' + toLoc);
      this.toLocation = toLoc;
      return resp;
    }catch(e){
      console.error(e);
      return 'An error occured while trying to update the to location to '+ toLoc;
    }
  }
}
