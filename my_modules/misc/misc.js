/*
function DateToString(date)
description:
  returns a string of the given date in the format 'YYYY/MM/DD HH:MM:SS:MMM'
arguments:
  date... a Date() object
return:
  returns a string of the given date in the format 'YYYY/MM/DD HH:MM:SS:MMM'
*/
function DateToString(date){
  let time = '';
  let dummy;
  time += date.getFullYear();
  time +='/';
  dummy = date.getMonth();
  time += dummy>9?dummy:('0'+dummy);
  time +='/';
  dummy = date.getDay();
  time += dummy>9?dummy:('0'+dummy);
  time +=' ';
  dummy = date.getHours();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMinutes();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getSeconds();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMilliseconds();
  time += dummy>99?dummy:(dummy>9?('0'+dummy):('00'+dummy));
  return time;
}

module.exports = {DateToString};