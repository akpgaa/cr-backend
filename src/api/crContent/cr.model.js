const { startConnection } = require("../../helpers/databaseConnection");
let connection = startConnection();
class CmsContent {

  static A(tableName, value) {
    return new Promise((resolve, reject) => {
      connection.query(
        `insert into ${tableName} set ?`,
        [value],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
  static sendmail(tableName, value) {
    return new Promise((resolve, reject) => {
      connection.query(
        `insert into ${tableName} set ?`,
        [value],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }




  static addMaster(tableName, value) {
    return new Promise((resolve, reject) => {
      connection.query(
        `insert into ${tableName} set ?`,
        [value],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static updateMaster(tableName, id, value, column = "id") {
    return new Promise((resolve, reject) => {
      connection.query(
        `update ${tableName} set ? where ${column} = ?`,
        [value, id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static deleteMaster(tableName, id) {
    return new Promise((resolve, reject) => {
      connection.query(
        `update ${tableName} set status='deactive' where id = ?`,
        [id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
  static getFreedom(selection, tableName, condition, groupby, orderby) {
    // console.log(
    //   `select ${selection} from ${tableName} where ${condition} group by ${groupby} order by ${orderby}`
    // );
    return new Promise((resolve, reject) => {
      connection.query(
        `select ${selection} from ${tableName} where ${condition} group by ${groupby} order by ${orderby}`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
  // static groupBy = (items, key, key1 = 'name') => items.reduce(
  //   (result, item) => ({
  //     ...result,
  //     [item[key1]]: [
  //       ...(result[item[key1]] || []),
  //       item,
  //     ],
  //   }),
  //   {},
  // );
}

module.exports = CmsContent;
