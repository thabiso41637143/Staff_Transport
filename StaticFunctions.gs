class generalFunctions{

  static formatDate(d){
    d = d || new Date();
    return Utilities.formatDate(new Date(d), 'GMT+0200', 'd MMMM yyyy');
  }

  static formatDateTime(dt){
    dt = dt || new Date();
    return Utilities.formatDate(new Date(dt), 'GMT+0200', 'd MMMM yyyy, HH:mm:ss');
  }

  static getTempFiles(){
    let templateFile = new Map();
    templateFile['passengertrips'] = {'Id':'1k7qaA5ZRhWgRVsrHx9rhUBJ4R4JN0jiRbsDrrsemDOg', 
    'name':'Trip Payment History', 'type':'Document', 'purpose': 'Trip History'};
    templateFile['messagereport'] = {'Id':'1GRlVCJmDBOsFEtb36y5I85UvGqOZh3aT5Ci-G8qcjQs', 
    'name':'Message Report History', 'type':'Document', 'purpose': 'Message Report'};
    templateFile['userhistory'] = {'Id':'1p8X43VqmOwCVUq90y_oMg9whwocRYB0Fk3t41dwcdRU', 
    'name':'Historic data', 'type':'Spreadsheet', 'purpose': 'User History'};
    return templateFile;
  }
  
}
