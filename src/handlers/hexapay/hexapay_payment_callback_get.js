import moment from "moment";
// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import {
  returnError,
  returnSuccess,
  sendMmail,
} from "../../libs/returnHandler";
import db from "../../libs/db";
import { url_send_email } from "../../libs/consts";
import getSQLQuery from "../../libs/getSQLQuery";
import axios from "axios";
const domain = process.env.domain;

async function hexapay_payment_callback(event, context) {
  try {
    console.log("headers", event.headers);
    console.log("body", event.body);
    console.log("queryStringParameters", event.queryStringParameters);
    console.log("pathParameters", event.pathParameters);
    let { status, uid, token } = event.queryStringParameters;
    let modified_date = moment().format("YYYY-MM-DD HH:mm:ss");
    /* IF status if successfull ,
      user_deposit.status = 1 user_deposit.modified_date currentime
      payment_history_transactions.is_processed = 1
      Send sms to user alert for amount
    */
    if (!status || !uid || !token) {
      return returnError(400, "Status or UID or Token is empty", "m");
    }
    const select_query = getSQLQuery(["1000"]);
    var transaction_history = await db.query(select_query, [token]);
    if (transaction_history && transaction_history.length > 0) {
      if (status == "successful") {
        const query = getSQLQuery([3004, 3005]);
        await db.query(query, [modified_date, token, 1, uid, status, token]);
        const query_user_data = getSQLQuery([1002]);
        let user_data = await db.query(query_user_data, [token]);
        if (user_data && user_data.length > 0) {
          let user_id = user_data[0].user_id;
          let balance = user_data[0].balance;
          let query_update_balance = getSQLQuery([3002]);
          await db.query(query_update_balance, [balance, user_id]);
          if (balance >= 1000) {
            try {
              await axios.get(url_send_email + "?transactionId=" + token);
            } catch (e) {
              return returnError(400, e, "m");
            }
          }
        } else {
          console.log("Can find transaction token to update user balanace");
        }
      } else {
        if (status == "pending") {
          var is_proccessed = 0;
        } else {
          var is_proccessed = 1;
        }
        const query = getSQLQuery([3005]);
        await db.query(query, [is_proccessed, uid, status, token]);
      }
      let headers = {
        "Content-Type": "text/html",
      };
      let html = `
      <html>
      <body>
        <h1> Page will be redirected in 2 sec. If page is not redirect click <a href="${domain}/account"> here </a></h1>
        <script>
          setTimeout(() => {
            window.location.href = "${domain}/account";
          },2000);
        </script>
        </body>
        </html>`;
      return returnSuccess(200, html, headers);
    } else {
      let headers = {
        "Content-Type": "text/html",
      };
      let html = `
      <html>
      <body>
        <h1> No such a transaction
        <script>
        setTimeout(() => {
          window.location.href = "${domain}/account";
        },2000);
      </script>
      </body>
      </html>`;
      return returnSuccess(200, html, headers);
    }
  } catch (e) {
    console.error(e);
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(hexapay_payment_callback);
