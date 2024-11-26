// import commonMiddelware from "../../libs/commonMiddleware";
import { sumSubKYCheckDigest, getApplicantData } from "../../libs/sumsub";
import db from "../../libs/db";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import getSQLQuery from "../../libs/getSQLQuery";
import axios from "axios";
import moment from "moment";
import { url_send_email } from "../../libs/consts";
async function userKYCWebhook(event, context) {
  try {
    console.log(event.headers);
    console.log(event.body);
    const body = JSON.parse(event.body);
    if (typeof body != "undefined") {
      var { type, reviewStatus, externalUserId, applicantId, reviewResult } =
        body;
      const sumsub_webhook_secret_key = process.env.sumsub_webhook_secret_key;
      var senderDigist = event.headers["X-Payload-Digest"];
      switch (type) {
        case "applicantCreated":
        case "applicantReviewed":
        case "applicantOnHold":
        case "applicantPending":
        case "applicantActionPending":
        case "applicantActionReviewed":
        case "applicantActionOnHold":
        case "applicantPrechecked":
        case "applicantPersonalInfoChanged":
        case "applicantDeleted":
        case "applicantReset":
          break;
        default:
          throw { message: "Message type is not valid - Sumsub webhooks" };
      }

      const digestVerified = await sumSubKYCheckDigest(
        sumsub_webhook_secret_key,
        senderDigist,
        event.body
      );
      if (digestVerified) {
        var checkExist = await db.query(getSQLQuery([1006]), [
          externalUserId,
          applicantId,
        ]);
        if (!checkExist || checkExist.length == 0) {
          console.log("This user dont exists");
          return returnError(200, "This user dont exists", "m");
        } else {
          if (reviewStatus == "completed") {
            var { reviewAnswer, reviewRejectType, rejectLabels } = reviewResult;
            if (reviewAnswer == "RED") {
              console.log("Status rejected", externalUserId);
              var createdDt = moment.utc().unix();
              rejectLabels = JSON.stringify(rejectLabels);
              await db.query(getSQLQuery([3006, 2000]), [
                3,
                externalUserId,
                externalUserId,
                reviewRejectType,
                rejectLabels,
                createdDt,
              ]);
              await axios.get(
                url_send_email +
                  "?type=sumsub&status=rejected&user_id=" +
                  externalUserId
              );
              db.quit();
              return returnSuccess(200, { message: "Status rejected" });
            } else {
              var createdDt = moment.utc().unix();
              console.log("Status approved", externalUserId);
              const applicantData = await getApplicantData(applicantId);
              let sumsub_message = JSON.stringify(applicantData);
              await db.query(getSQLQuery([3006, 2000]), [
                // 3006 - Update KYC Status
                2,
                externalUserId,
                // 2000 - Insert sumsub messages
                externalUserId,
                "verified",
                sumsub_message,
                createdDt,
              ]);
              await axios.get(
                url_send_email +
                  "?type=sumsub&status=approved&user_id=" +
                  externalUserId
              );
              db.quit();
              return returnSuccess(200, { message: "Status approved" });
            }
          } else {
            console.log("Status pending", externalUserId);
            await db.query(getSQLQuery([3006]), [0, externalUserId]);
            db.quit();
            return returnSuccess(200, { message: "Status pending" });
          }
        }
      } else {
        console.log("Not valid digest code");
        return returnSuccess(400, { message: "Not valid digest code" });
      }
    }
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = userKYCWebhook;
