import moment from "moment";
// Local Libs
import commonMiddelware from "../libs/commonMiddleware";
import { returnError, returnSuccess } from "../libs/returnHandler";

async function test(event, context) {
  try {
    console.log("headers", event.headers);
    console.log("body", event.body);
    console.log("queryStringParameters", event.queryStringParameters);
    console.log("pathParameters", event.pathParameters);
    let return_data = {
      current_datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    return returnSuccess(200, { data: return_data });
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(test);
