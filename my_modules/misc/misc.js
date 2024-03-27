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
  dummy = date.getMonth() + 1;
  time += dummy>9?dummy:('0'+dummy);
  time +='/';
  dummy = date.getDate();
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

/*
function validateString(string, minLength, maxLength, $_regex)
description:
  determains if the given string is valid
arguments:
  string... the string to check
  minLength.. the minimum length of the string
  maxLength... the maximum length of the string
  $_regex... (optional) a regular expression for allowed characters to check against, $_regex MUST have a global flag /.../g
return:
  true, if the string is valid, else false
*/
function validateString(string, minLength, maxLength, $_regex = undefined){
  if (string && typeof string === 'string' && string.length>=minLength && string.length<=maxLength){
    if (!$_regex){
      return true;
    }
    let stringMatch = string.match($_regex);
    if (stringMatch!==null && stringMatch[0]===string){
      return true;
    }
  }
  return false;
}



/**
 * from: https://stackoverflow.com/questions/15760067/node-js-mysql-transaction
 * Run multiple queries on the database using a transaction. A list of SQL queries
 * should be provided, along with a list of values to inject into the queries.
 * @param  {array} queries     An array of mysql queries. These can contain `?`s
 *                              which will be replaced with values in `queryValues`.
 * @param  {array} queryValues An array of arrays that is the same length as `queries`.
 *                              Each array in `queryValues` should contain values to
 *                              replace the `?`s in the corresponding query in `queries`.
 *                              If a query has no `?`s, an empty array should be provided.
 * @return {Promise}           A Promise that is fulfilled with an array of the
 *                              results of the passed in queries. The results in the
 *                              returned array are at respective positions to the
 *                              provided queries.
 */
async function transaction(queries, queryValues) {
  if (queries.length !== queryValues.length) {
      return Promise.reject(
          'Number of provided queries did not match the number of provided query values arrays'
      )
  }
  const connection = await mysql.createConnection(databaseConfigs)
  try {
      await connection.beginTransaction()
      const queryPromises = []

      queries.forEach((query, index) => {
          queryPromises.push(connection.query(query, queryValues[index]))
      })
      const results = await Promise.all(queryPromises)
      await connection.commit()
      await connection.end()
      return results
  } catch (err) {
      await connection.rollback()
      await connection.end()
      return Promise.reject(err)
  }
}


module.exports = {DateToString,
                  validateString,
                  transaction};