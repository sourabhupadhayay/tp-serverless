import moment from "moment";
// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import {
  returnError,
  returnSuccess,
  sendMmail,
} from "../../libs/returnHandler";
import db from "../../libs/db";
const domain = process.env.domain;
import { url_send_email } from "../../libs/consts";
import axios from "axios";

async function hexapay_payment_callback(event, context) {
  try {
    console.log("headers", event.headers);
    console.log("body", event.body);
    console.log("queryStringParameters", event.queryStringParameters);
    console.log("pathParameters", event.pathParameters);
    let status = "";
    let uid = "";
    let token = "";
    /* IF status if successfull ,
      user_deposit.status = 1 user_deposit.modified_date currentime
      payment_history_transactions.is_processed = 1
      Send sms to user alert for amount
    */
    status = event.body.transaction.status;
    uid = event.body.transaction.uid;
    // token = event.body.transaction;
    if (status == "successful") {
      let modified_date = moment().format("YYYY-MM-DD HH:mm:ss");
      const query = `
        UPDATE user_deposit SET status = 1, modified_date = ? WHERE transaction_token = ?;
        UPDATE payment_history_transactions SET is_processed = 1, provider_uid = ? WHERE transaction_token = ?;
      `;
      await db.query(query, [modified_date, token, uid, token]);
      const query_user_data = `SELECT user_id, balance FROM user_deposit WHERE transaction_token = ?;`;
      let user_data = await db.query(query_user_data, [token]);
      if (user_data && user_data.length > 0) {
        let user_id = user_data[0].user_id;
        let balance = user_data[0].balance;
        let query_update_balance = `UPDATE users SET balance = balance + ? WHERE user_id = ?;`;
        await db.query(query_update_balance, [balance, user_id]);
        if (balance >= 1000) {
          try {
            var res = await axios.get(
              url_send_email + "?transactionId=" + token
            );
            return returnSuccess(200, res.data);
          } catch (e) {
            return returnError(400, e, "m");
          }
        }
      } else {
        console.log("Can find transaction token to update user balanace");
      }
    } else if (status == "canceled") {
    } else if (status == "decline") {
    } else {
      return returnError(400, "Status undefined", "m");
    }
    let headers = {
      "Content-Type": "text/html",
    };
    let html = `
      <h1> Page will be redirected in 2 sec. If page is not redirect click <a href="${domain}/account"> here </a> </h1> 
      <script>
      setTimeout(() => {
        window.location.href = "${domain}/account";
      },2000);
    </script>`;
    return returnSuccess(200, html, headers);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(hexapay_payment_callback);
