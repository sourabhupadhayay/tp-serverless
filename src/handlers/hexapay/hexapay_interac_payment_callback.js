import moment from "moment";
// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import getSQLQuery from "../../libs/getSQLQuery";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";

async function hexapay_interac_payment_callback(event, context) {
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

    var modified_date = moment().format("YYYY-MM-DD HH:mm:ss");

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
    const select_query = getSQLQuery(["1001"]);
    var user_data = await db.query(select_query, [tracking_id]);
    if (user_data && user_data.length > 0) {
      if (status == "successful") {
        const query = getSQLQuery([3000, 3001, 3002]);
        await db.query(query, [
          modified_date,
          login_id,
          tracking_id,
          1,
          uid,
          status,
          converted_balance,
          login_id,
          tracking_id,
          balance,
          login_id,
        ]);
      } else {
        if (status == "pending") {
          var is_proccessed = 0;
        } else {
          var is_proccessed = 1;
        }
        const query = getSQLQuery([3001]);
        await db.query(query, [
          is_proccessed,
          uid,
          status,
          converted_balance,
          login_id,
          tracking_id,
        ]);
      }
      let return_data = {
        current_datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
      };
      db.quit();
      return returnSuccess(200, { data: return_data });
    } else {
      db.quit();
      return returnError(400, "No such a transaction", "m");
    }
  } catch (e) {
    console.log(e);
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(hexapay_interac_payment_callback);
