import moment from "moment";
// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import getSQLQuery from "../../libs/getSQLQuery";
import db from "../../libs/db";

async function hexapay_interac_withdraw_callback(event, context) {
  try {
    console.log("headers", event.headers);
    console.log("body", event.body);
    console.log("queryStringParameters", event.queryStringParameters);
    console.log("pathParameters", event.pathParameters);
    const { transaction } = event.body;
    if (!transaction) {
      db.quit();
      return returnError(400, "Transaction is invalid", "m");
    }
    var {
      status,
      uid,
      interac: { login_id },
      tracking_id,
      amount,
    } = transaction;
    // var modified_date = moment().format("YYYY-MM-DD HH:mm:ss");
    var balance = (amount / 100).toFixed(2);
    const exchange_query = getSQLQuery(["1008"]);
    var exchangeRate = await db.query(exchange_query, []);
    var rate = 1;
    if (exchangeRate && exchangeRate.length > 0) {
      var rate = exchangeRate[0].exchange;
      rate = Number(rate) + Number(rate) / 100;
      rate = 1 / rate;
    }
    var converted_balance = (balance * rate).toFixed(2);
    console.log(converted_balance ,'CONV');
    if (status != "successful") {
      const select_query = getSQLQuery([1003]);
      var withdraw_history = await db.query(select_query, [login_id, tracking_id]);
      if(withdraw_history != '' && withdraw_history.length != 0){
        var is_proccessed = 0;
        if(status == 'pending'){
          var is_proccessed = 0;
          const query = getSQLQuery([3003]);
          await db.query(query, [is_proccessed, uid, "2", status, converted_balance, converted_balance, login_id, tracking_id]);
        }else{
          var is_proccessed = 1;
          const query = getSQLQuery([3003, 3002]);
          await db.query(query, [is_proccessed, uid, "2", status, converted_balance, converted_balance, login_id, tracking_id, converted_balance, login_id]);
        }
      }else{
        console.log('No such a transaction '+tracking_id+' for user'+login_id)
        return returnError(400, e, "No such a transaction");
      }
    } else {
      const query = getSQLQuery([3003]);
      await db.query(query, [1, uid, "1", status, converted_balance, converted_balance, login_id, tracking_id]);
    }
    let return_data = {
      current_datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    return returnSuccess(200, { data: return_data });
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(hexapay_interac_withdraw_callback);
