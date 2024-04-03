class generalFunctions{

  static formatDate(d){
    d = d || new Date();
    return Utilities.formatDate(new Date(d), 'GMT+0200', 'd MMMM yyyy');
  }

  static formatDateTime(dt){
    dt = dt || new Date();
    return Utilities.formatDate(new Date(dt), 'GMT+0200', 'd MMMM yyyy, HH:mm:ss');
  }
  
}
