import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import AWS from "aws-sdk";
import { PassThrough } from "stream";
import db from "../libs/db";
import getSQLQuery from "../libs/getSQLQuery";
import moment from "moment";
const s3 = new AWS.S3();
var config = {};
config.baseURL = process.env.sumsub_base_url;

const createSignature = () => {
  // Timestamp
  var ts = Math.floor(Date.now() / 1000);
  // Request Signature
  const signature = crypto.createHmac("sha256", process.env.sumsub_secret_key);
  signature.update(ts + config.method.toUpperCase() + config.url);

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }
  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");
  return config;
};

const createApplicantID = async (vars) => {
  var { firstName, lastName, userId } = vars;
  var method = "post";
  var url = "/resources/applicants?levelName=basic-kyc-level";
  var body = {
    externalUserId: userId,
    info: {
      firstName: firstName,
      lastName: lastName,
    },
  };

  config.method = method;
  config.url = url;
  config.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": process.env.sumsub_app_token,
  };
  config.data = JSON.stringify(body);
  return new Promise((resole, reject) => {
    axios(createSignature())
      .then(function (response) {
        console.log(response);
        return resole({
          statusCode: 200,
          applicant_id: response.data.id,
        });
      })
      .catch(function (error) {
        console.log(error.response);
        return resole({
          statusCode: 400,
          err: error.data,
        });
      });
  });
};

const getApplicantStatus = async (applicant_id, ttlInSecs = 600) => {
  // Creating an access token for initializng SDK...
  config.method = "get";
  config.url = `/resources/applicants/${applicant_id}/status`;
  config.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": process.env.sumsub_app_token,
  };
  return new Promise((resole, reject) => {
    axios(createSignature())
      .then(function (response) {
        console.log(response);
        return resole({
          statusCode: 200,
          data: response,
        });
      })
      .catch(function (error) {
        console.log(error);
        return resole({
          statusCode: 400,
          error,
        });
      });
  });
};

const requiredIdDocsStatus = async (applicant_id) => {
  // Creating an access token for initializng SDK...
  config.method = "get";
  config.url = `/resources/applicants/${applicant_id}/requiredIdDocsStatus`;
  config.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": process.env.sumsub_app_token,
  };
  config.data = null;
  return new Promise((resole, reject) => {
    axios(createSignature())
      .then(function (response) {
        console.log(response);
        return resole({
          statusCode: 200,
          data: response.data,
        });
      })
      .catch(function (error) {
        console.log(error);
        return resole({
          statusCode: 400,
          error,
        });
      });
  });
};

const getDocumentImage = async (imageId, inspectionId) => {
  console.log("Getting document images for " + imageId);
  config.method = "get";
  config.url = `/resources/inspections/${inspectionId}/resources/${imageId}`;
  config.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": process.env.sumsub_app_token,
  };
  config.data = null;
  config.responseType = "stream";
};

const getAccessToken = async (vars) => {
  const sumsub_level_name = "basic-kyc-level";
  console.log("Get Access Token", vars);
  var { user_id } = vars;
  if (!user_id) {
    return {
      statusCode: 400,
      error: "User id is empty",
    };
  }
  var method = "post";
  var url =
    "/resources/accessTokens?userId=" +
    user_id +
    "&levelName=" +
    sumsub_level_name;
  config.method = method;
  config.url = url;
  config.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": process.env.sumsub_app_token,
  };
  // config.data = JSON.stringify(body);
  return new Promise((resole, reject) => {
    axios(createSignature())
      .then(function (response) {
        console.log(response);
        return resole({
          statusCode: 200,
          data: response.data,
        });
      })
      .catch(function (error) {
        if (error.message == "Request failed with status code 402") {
          var data = {
            token: user_id,
            userId: user_id,
          };
          return resole({
            statusCode: 200,
            data: data,
          });
        }
        return resole({
          statusCode: 400,
          error: error,
        });
      });
  });
};

const getApplicantData = async (applicant_id) => {
  return new Promise((resole, reject) => {
    var url = `/resources/applicants/${applicant_id}/one`;
    config.method = "get";
    config.url = url;
    config.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-App-Token": process.env.sumsub_app_token,
    };
    config.data = "{}";
    let configs = createSignature();
    axios(configs)
      .then(function (response) {
        console.log(response);
        var data = {
          info: response.data.info,
          addresses: response.data.fixedInfo
        }
        return resole({
          statusCode: 200,
          data: data,
        });
      })
      .catch(function (error) {
        console.log(error);
        return resole({
          statusCode: 400,
          error: error,
        });
      });
  });
};

const uploadFromStream = (fileResponse, fileName, bucket) => {
  console.log("Start upload to s3");
  const passThrough = new PassThrough();
  const promise = s3
    .upload({
      Bucket: bucket,
      Key: fileName,
      ContentType: fileResponse.headers["content-type"],
      ContentLength: fileResponse.headers["content-length"],
      Body: passThrough,
    })
    .promise();
  return { passThrough, promise };
};

const downloadFile = async (imageid, inspectionId) => {
  await getDocumentImage(imageid, inspectionId);
  console.log(config);
  return await axios(createSignature());
};

const process_download = async (
  image_row,
  user_id,
  applicant_id,
  inspectionId
) => {
  var createdDt = moment().unix();
  const responseStream = await downloadFile(image_row.image, inspectionId);
  const { passThrough, promise } = uploadFromStream(
    responseStream,
    applicant_id + "_" + image_row.image + ".png",
    "swifty-global-app-assets-private/documents"
  );
  responseStream.data.pipe(passThrough);
  await db.query(getSQLQuery([2021]), [
    user_id,
    applicant_id,
    image_row.type,
    image_row.image + ".png",
    createdDt,
    image_row.country, // 2021
  ]);
  return promise
    .then((result) => {
      return result.Location;
    })
    .catch((e) => {
      throw e;
    });
};

const downloadDocumentsPerApplicant = async (applicant_id, user_id) => {
  var i = 0;
  var a;
  var responseApplicantStatus = await getApplicantStatus(applicant_id);
  console.log(responseApplicantStatus);
  if (responseApplicantStatus.statusCode == 200) {
    var responserequiredIdDocsStatus = await requiredIdDocsStatus(applicant_id);
    console.log(responserequiredIdDocsStatus);
    var inspectionId = responseApplicantStatus.data.data.inspectionId;
    var all_images = [];
    if (responserequiredIdDocsStatus.data.IDENTITY) {
      var identity_images = responserequiredIdDocsStatus.data.IDENTITY.imageIds;
      for (i = 0; i < identity_images.length; i++) {
        a = {
          image: identity_images[i],
          type: responserequiredIdDocsStatus.data.IDENTITY.idDocType,
          country: responserequiredIdDocsStatus.data.IDENTITY.country,
        };
        all_images.push(a);
      }
    }
    if (responserequiredIdDocsStatus.data.SELFIE) {
      var selfie_images = responserequiredIdDocsStatus.data.SELFIE.imageIds;
      for (i = 0; i < selfie_images.length; i++) {
        a = {
          image: selfie_images[i],
          type: responserequiredIdDocsStatus.data.SELFIE.idDocType,
          country: responserequiredIdDocsStatus.data.SELFIE.country,
        };
        all_images.push(a);
      }
    }
    // Identity images
    for (i = 0; i < all_images.length; i++) {
      var image_row = all_images[i];
      var image_filename = image_row.image + ".png";
      var image_db = await db.query(getSQLQuery([1099]), [
        user_id,
        applicant_id,
        image_filename,
      ]);
      if (image_db && image_db.length == 0) {
        await process_download(image_row, user_id, applicant_id, inspectionId);
      }
    }
    console.log("Finished");
    return true;
  } else {
    console.log(responseApplicantStatus.error);
    return false;
  }
};

const sumSubKYCheckDigest = async (secret_key, payload_digest, body) => {
  const calculatedDigest = crypto
    .createHmac("sha1", secret_key)
    .update(body)
    .digest("hex");
  console.log("calculatedDigest", calculatedDigest);
  console.log("payload_digest", payload_digest);
  return calculatedDigest === payload_digest;
};
export {
  getApplicantStatus,
  createApplicantID,
  getAccessToken,
  getApplicantData,
  downloadDocumentsPerApplicant,
  sumSubKYCheckDigest,
};
