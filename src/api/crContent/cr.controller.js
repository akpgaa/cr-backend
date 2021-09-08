const CmsContent = require("./cr.model");
const { endConnection } = require("../../helpers/databaseConnection");
const chalk = require("chalk");
const config = require("../../config");
const fs = require("fs");
const request = require("request");
const moment = require("moment");
const path = require("path");

require('dotenv').config();
const nodemailer = require('nodemailer');

const rootPath = path.dirname(
  require.main.filename || process.mainModule.filename
);
const { stringify } = require("querystring");
const { result } = require("lodash");




const getFreedom = async (req, res, next) => {
  let body = req.body.value ? req.body.value : req.body;
  let device = req.body.device;

  try {
    var result = [];
    if (device && device.id) {
      let check = await comparingObj(req);
      if (check) {
        result = await CmsContent.getFreedom(
          body.select,
          body.tableName,
          body.condition,
          body.groupby,
          body.orderby
        );
      } else {
        result = false;
      }
    } else {
      result = await CmsContent.getFreedom(
        body.select,
        body.tableName,
        body.condition,
        body.groupby,
        body.orderby
      );
    }
    //db end connection
    endConnection();
    res.send(result);
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const addMaster = (req, res, next) => {
  try {
    let tablename = req.params.tablename;
    let body = req.body;
    let result = CmsContent.addMaster(tablename, body)
    endConnection();
    res.send(result);
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};


// const sendmail = (req,res,next) =>{
// var sender = nodemailer.createTransport(
// {
//   host: "0.0.0.0",
//   port: 25255,
// service:'gmail',
// auth:
// {
// user:'xx368528@gmail.com',
// pass:'maha@1999'
// }
// });

// var composemail ={
// from:'xx368528@gmail.com',
// to:'xyz@gmail.com',
// subject:'maha',
// text:'hi'
// };
// html: '<h1>Attachments</h1>',
//   attachments
//     {  
//         filename: 'Report.pdf'
//     }


// sender.sendMail(composemail,function(error,info){
// if(error)
// {
// console.log(error);
// }
// else{
// console.log("mail sent successsfully"+info.response);
// }
// });
//   res.send("Success")
// };



const GetData = async (req, res, next) => {
  try {

    // let city = await CmsContent.getFreedom('*', 'city', 1, 1, 1)
    // let zone = await CmsContent.getFreedom('*', 'ps_zone', 1, 1, 1)
    // let range = await CmsContent.getFreedom('*', 'ps_range', 1, 1, 1)
    let Info = await CmsContent.getFreedom('cr_identifier ,Personal_Details_Name_First ,Personal_Details_Native_Police_Station ', 'cr_information', 1, 1, 1)
    // let station = await CmsContent.getFreedom(
    //   'cr_information.cr_identifier,cr_information.Personal_Details_Name_First ,cr_information.Personal_Details_Native_Police_Station,ps_station.station_id,ps_station.station_name,ps_range.range_id,ps_range.range_name,ps_district.district_id,ps_district.district_name,ps_zone.zone_id,ps_zone.zone_name,city.city_name,city.city_id',
    //   'ps_station,ps_district,ps_range,ps_zone,city,cr_information',
    //   'substr(cr_information.personal_Details_Native_Police_station,1,2)=ps_station.station_id and ps_zone.city_id=city.city_id and ps_district.zone_id=ps_zone.zone_id and  ps_range.district_id=ps_district.district_id and ps_station.range_id=ps_range.range_id',
    //   1,
    //   1)
    let station = await CmsContent.getFreedom(
      'ps_station.station_id,ps_station.station_name,ps_range.range_id,ps_range.range_name,ps_district.district_id,ps_district.district_name,ps_zone.zone_id,ps_zone.zone_name,city.city_name,city.city_id',
      'ps_station,ps_district,ps_range,ps_zone,city',
      'ps_zone.city_id=city.city_id and ps_district.zone_id=ps_zone.zone_id and  ps_range.district_id=ps_district.district_id and ps_station.range_id=ps_range.range_id',
      1,
      1)
    // groupBy
    let returndata = []
    let wait = await station.map((ival) => {
      Info.map((jval) => {
        if (jval.Personal_Details_Native_Police_Station) {
          let result = jval.Personal_Details_Native_Police_Station.split(' ')
          if (ival.station_id == result[0]) {
            ival.cr_identifier = jval.cr_identifier
            ival.Personal_Details_Name_First = jval.Personal_Details_Name_First
            // returndata.push(ival)
          }
        }
      })
    })
    await Promise.all(wait)
    // for ciry
    let result = await CmsContent.groupBy(station, 'city_id', 'city_name')
    //for zone
    let result1 = {}
    let wait1 = await Object.keys(result).map(async key => {
      result1[key] = await CmsContent.groupBy(result[key], 'zone_id', 'zone_name')
      // console.log(result1[key]);
    })
    await Promise.all(wait1)
    // for range
    let result2 = {}
    let wait2 = await Object.keys(result1).map(async key => {
      result2[key] = {}
      let wait3 = await Object.keys(result1[key]).map(async key1 => {
        result2[key][key1] = await CmsContent.groupBy(result1[key][key1], 'range_id', 'range_name')
        // console.log(result1[key]);
      })
      await Promise.all(wait3)
    })
    await Promise.all(wait2)

    // ..for district
    let result3 = {}
    let wait4 = await Object.keys(result2).map(async key => {
      result3[key] = {}
      let wait3 = await Object.keys(result2[key]).map(async key1 => {
        result3[key][key1] = {}
        let wait5 = await Object.keys(result2[key][key1]).map(async key2 => {
          // console.log(result2[key][key1][key2]);
          result3[key][key1][key2] = await CmsContent.groupBy(result2[key][key1][key2], 'district_id', 'district_name')
          // console.log(result1[key]);
        })
        await Promise.all(wait5)
      })
      await Promise.all(wait3)
    })
    await Promise.all(wait4)

    // for staion
    let result4 = {}
    let wait7 = await Object.keys(result3).map(async key => {
      result4[key] = {}
      let wait3 = await Object.keys(result3[key]).map(async key1 => {
        result4[key][key1] = {}
        let wait5 = await Object.keys(result3[key][key1]).map(async key2 => {
          result4[key][key1][key2] = {}
          let wait6 = await Object.keys(result3[key][key1][key2]).map(async key3 => {
            // console.log(result3[key][key1][key2]);
            result4[key][key1][key2][key3] = await CmsContent.groupBy(result3[key][key1][key2][key3], 'station_id', 'station_name')
            // console.log(result1[key]);
          })
          await Promise.all(wait6)
        })
        await Promise.all(wait5)
      })
      await Promise.all(wait3)
    })
    await Promise.all(wait7)


    res.send(result4)
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const getsingledata = async (req, res, next) => {
  try {
    let id = req.body.id
    console.log(req.body);
    // let city = await CmsContent.getFreedom('*', 'city', 1, 1, 1)
    // let zone = await CmsContent.getFreedom('*', 'ps_zone', 1, 1, 1)
    // let range = await CmsContent.getFreedom('*', 'ps_range', 1, 1, 1)
    let Info = await CmsContent.getFreedom('*', 'cr_information', `cr_identifier=${id}`, 1, 1)

    res.send(Info)
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

module.exports = {

  // sandboxtest,
  getFreedom,
  addMaster,
  GetData,
  getsingledata
  // sendmail
};
