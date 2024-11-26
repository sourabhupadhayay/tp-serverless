import commonMiddelware from "../../libs/commonMiddleware";
import { createApplicantID, getAccessToken } from "../../libs/sumsub";
import db from "../../libs/db";
import {returnError, returnSuccess} from "../../libs/returnHandler";
import getSQLQuery from "../../libs/getSQLQuery";
import axios from "axios";
import { url_get_user } from "../../libs/consts";

async function userKYCGetAccessToken(event, context) {
  try {
    const {sessionKey } = event.queryStringParameters;
    const headers = {
      session_key: sessionKey,
    };
    var res = await axios.post(url_get_user, {}, {headers});
    if(res.data.ResponseCode == 200){
      var user_data = res.data.Data.user_profile;
      var user_id = user_data.user_id;
      if(!user_data.applicant_id){
        const res_applicant_id = await createApplicantID({
          firstName: user_data.first_name,
          lastName: user_data.last_name,
          userId: user_id
        });
        if(res_applicant_id.applicant_id){
          var applicant_id = res_applicant_id.applicant_id
          var queryLog = getSQLQuery([3007]);
          await db.query(queryLog, [applicant_id, user_id]);
        }else{
          console.log('Undefined applicant id');
          return returnError(400, 'Undefined applicant id', "m");
        }
      }
      var access_token = await getAccessToken({ user_id: user_id });
      if (access_token.statusCode != 200) {
        console.log('Sumsub problems');
        throw { statusCode: 400, message: "Sumsub problems" };
      }
      db.quit();
      return returnSuccess(200, {token: access_token.data.token, userId: access_token.data.userId});
    }else{
      console.log('Undefined user');
      return returnError(400, 'Undefined user', "m");
    }
  } catch (e) {
    console.log(e);
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(userKYCGetAccessToken);