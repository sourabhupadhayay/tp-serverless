// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import axios from "axios";
import db from "../../libs/db";

async function cron_currencies(event, context) {
  try {
    let source = "EUR";
    let currencies = "CAD";
    let url = `https://apilayer.net/api/live?access_key=${process.env.currencylayer_key}&currencies=${currencies}&source=${source}&format=1`;
    var res = await axios.get(url);
    if (res.data.success) {
      let timestamp = res.data.timestamp;
      let quotes = res.data.quotes;
      let keys = Object.keys(quotes);
      let query_insert = ``;
      for (let i = 0; i < keys.length; i++) {
        const key_name = keys[i];
        const quote = quotes[key_name];
        query_insert += `INSERT INTO currency_exchange (currenies, exchange, timestamp) VALUE ('${key_name}',${quote},${timestamp});`;
      }
      await db.query(query_insert);
    }
    console.log(res.data);
    db.quit();
    return returnSuccess(200, res.data);
  } catch (e) {
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_currencies);
