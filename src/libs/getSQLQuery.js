const getSQLQuery = (queryCode, vars = "") => {
  var query = "";
  for (var i = 0; i < queryCode.length; i++) {
    var code = queryCode[i] + "";
    var code_type = code.substring(0, 1);
    switch (code_type) {
      case "1":
        query += getSelectQuery(code, vars);
        break;
      case "2":
        query += getInsertQuery(code);
        break;
      case "3":
        query += getUpdateQuery(code);
        break;
      case "4":
        query += getDeleteQuery(code);
        break;
      case "9":
        query += getAnalyticsQuery(code);
        break;
      default:
        return false;
    }
  }
  return query;
};

const getSelectQuery = (code, vars = "") => {
  const quries = {
    1000: `SELECT * FROM user_deposit WHERE transaction_token = ? AND status = 0;`,
    1001: `SELECT * FROM user_deposit WHERE transaction_id = ? AND status = 0;`,
    1002: `SELECT user_id, balance FROM user_deposit WHERE transaction_token = ?;`,
    1003: ` SELECT        PWT.* 
            FROM          payment_history_transactions PHT 
            LEFT JOIN     payment_withdraw_transactions PWT
              ON          PWT.withdraw_uid = PHT.gateway_withdraw_transaction_id 
            WHERE         PHT.user_id = ?
            AND           PHT.gateway_interac_withdraw_transaction_id = ?
            AND           PHT.is_processed = 0;`,
    1004: ` SELECT        *
            FROM          seasons
            WHERE         checked_postp = 0
            AND           status = 'Postp.'
            LIMIT         20;`,
    1005: "SELECT * FROM active_login where `key` = ?;",
    1006: "SELECT * FROM users WHERE user_id = ? AND applicant_id = ?;",
    1007: `
            SELECT 				  C.* , 0 AS result
            FROM 				    contests C
            LEFT JOIN 			contest_users CU
              ON					  CU.contest_id = C.contest_id
            LEFT JOIN			  contest_user_predictions CUP 
              ON					  CUP.contest_user_id = CU.contest_user_id
            WHERE				    CUP.contest_user_prediction_id IS NULL
            AND 					  C.finished_all_matches = 1
            AND					    C.status = 2
            AND             C.is_golf = 0
        UNION 
            SELECT 				  C.*, SUM(CUP.result) AS result 
            FROM 				    contests C
            LEFT JOIN 			contest_users CU
              ON					  CU.contest_id = C.contest_id
            LEFT JOIN			  contest_user_predictions CUP 
              ON					  CUP.contest_user_id = CU.contest_user_id
            WHERE				    C.finished_all_matches = 1
            AND					    C.status = 2
            AND             C.is_golf = 0
            GROUP BY        C.contest_id
            HAVING 	        result = 0;`,
    1008: `SELECT exchange FROM currency_exchange WHERE currenies = 'EURCAD' ORDER BY timestamp DESC LIMIT 1;`,
    1009: `SELECT * FROM background_process_previous_matches ORDER BY created_dt ASC LIMIT 1;`,
    1010: `SELECT * FROM seasons WHERE season_id = ?;`,
    1011: `
          SELECT        distinct S.season_id, S.league_id, S.scheduled_date_time, S.home, L.league_feed_id,
                        S.away, S.match_result, T.team_name AS home_name, T1.team_name AS away_name
          FROM          seasons S
          LEFT JOIN     leagues L
            ON          L.league_id = S.league_id
          LEFT JOIN     teams T
            ON          T.team_id = S.home AND S.league_id = T.league_id
          LEFT JOIN     teams T1
            ON          T1.team_id = S.away AND S.league_id = T1.league_id
          WHERE         S.league_id = ?
          AND           S.home = ?
          AND           S.season_id < ?
          AND           match_result IS NOT NULL
          ORDER BY      S.season_id ASC
          LIMIT         5;`,
    1012: `SELECT       distinct S.season_id, S.league_id, S.scheduled_date_time, S.home, L.league_feed_id,
                        S.away, S.match_result, T.team_name AS home_name, T1.team_name AS away_name
          FROM          seasons S
          LEFT JOIN     leagues L
            ON          L.league_id = S.league_id
          LEFT JOIN     teams T
            ON          T.team_id = S.home AND S.league_id = T.league_id
          LEFT JOIN     teams T1
            ON          T1.team_id = S.away AND S.league_id = T1.league_id
          WHERE         S.league_id = ?
          AND           S.away = ?
          AND           S.season_id < ?
          AND           match_result IS NOT NULL
          ORDER BY      S.season_id ASC
          LIMIT         5;`
  };
  return quries[code];
};

const getInsertQuery = (code) => {
  // 2XXX
  const quries = {
    // users_wage
    2000: `INSERT INTO sumsub_messages (user_id, type, message, createdDt) VALUES (?, ?, ?, ?)`,
    2001: `INSERt INTO payment_history_transactions (payment_for, user_id, contest_id, description, payment_type, total_transaction_amount, deducted_user_balance, created_date, is_processed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  };
  return quries[code];
};

const getUpdateQuery = (code) => {
  // 3XXX
  const queris = {
    3000: "UPDATE user_deposit SET status = 1, modified_date = ? WHERE user_id = ? AND transaction_id = ?; ",
    3001: "UPDATE payment_history_transactions SET is_processed = ?, provider_uid = ?, status = ?, total_transaction_amount = ? WHERE user_id = ? AND gateway_deposit_transaction_id = ?;",
    3002: "UPDATE users SET balance = balance + ? WHERE user_id = ?;",
    3003: `
          UPDATE        payment_history_transactions PHT 
          LEFT JOIN     payment_withdraw_transactions PWT 
            ON          PWT.withdraw_uid = PHT.gateway_withdraw_transaction_id 
          SET           PHT.is_processed = ?, PHT.provider_uid = ?, PWT.status = ?, PHT.status = ?, PHT.total_transaction_amount = ?, PWT.amount = ?
          WHERE         PHT.user_id = ?
          AND           PHT.gateway_interac_withdraw_transaction_id = ?;`,
    3004: `UPDATE user_deposit SET status = 1, modified_date = ? WHERE transaction_token = ?;`,
    3005: `UPDATE payment_history_transactions SET is_processed = ?, provider_uid = ?, status = ? WHERE transaction_token = ?;`,
    3006: "UPDATE users SET kyc_status = ? WHERE user_id = ?;",
    3007: "UPDATE users SET applicant_id = ? WHERE user_id = ?;",
    3008: "UPDATE contests SET status = ? WHERE contest_id = ?;"
  };
  return queris[code];
};

const getDeleteQuery = (code) => {
  const quries = {
    4000: `DELETE FROM season_previous_matches WHERE season_id = ?;`,
    4001: `DELETE FROM background_process_previous_matches WHERE season_id = ?;`
  };
  return quries[code];
};

const getAnalyticsQuery = (code) => {
  const quries = {
    9000: ``,
  };
  return quries[code];
};

export default getSQLQuery;
