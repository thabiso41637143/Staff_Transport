
/**
 * 
 */
function updateTripChanges() {
  let tripLog = new logTracker();
  tripLog.updateAttTripLog();
}

/**
 * 
 */
function updatePaymentChanges(){
  let tripLog = new logTracker();
  tripLog.updatePaymentLog();
}

/**
 * 
 */
function updateTripPaymentChanges(){
  let tripLog = new logTracker();
  tripLog.updateTripPaymentLog();
}
/**
 * 
 */
function updateNewPassenger(){
  let capLog = new logTracker();
  capLog.updateCapPassLog();
}

/**
 * This function I run it manual to create a drive in the system
 */
function updateNewDriver(){
  let driver = new capturePassenger('Admin', 207, 'Tshegofatso Mampana', '(079) 379 4079', 'Driver', '', '', 'tshego.seregobona@gmail.com');
  driver.capturePass('addnewuser');
}
