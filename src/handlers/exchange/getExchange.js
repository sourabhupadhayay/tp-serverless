// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import {
  activity_log,
  returnError,
  returnSuccess,
} from "../../libs/returnHandler";
import db from "../../libs/db";

async function getExchange(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    await activity_log(event, context);
    let exchange = 1;
    const { convert } = event.queryStringParameters;
    if (convert == "EURCAD") {
      let result = await db.query(
        "SELECT exchange FROM currency_exchange WHERE currenies = ? ORDER BY timestamp DESC LIMIT 1;",
        [convert]
      );
      if (result && result.length > 0) {
        exchange = result[0].exchange;
        exchange = Number(exchange) + Number(exchange) / 100;
      }
    }
    db.quit();
    return returnSuccess(200, {
      exchange: exchange,
    });
  } catch (e) {
    db.quit();
    console.log(e.message);
    return returnError(400, e.message, "m");
  }
}
export const handler = commonMiddelware(getExchange);
