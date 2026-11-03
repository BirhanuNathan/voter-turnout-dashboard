const snowflake = require('snowflake-sdk');
snowflake.configure({ logLevel: 'ERROR' });

function connect() {
  const opts = {
    account: process.env.SNOWFLAKE_ACCOUNT, // e.g. myorg-myaccount
    username: process.env.SNOWFLAKE_USER,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'VOTER_WH',
    database: process.env.SNOWFLAKE_DATABASE || 'VOTER_DB',
    schema: process.env.SNOWFLAKE_SCHEMA || 'TURNOUT',
    role: process.env.SNOWFLAKE_ROLE || 'VOTER_API_ROLE',
  };
  if (process.env.SNOWFLAKE_PRIVATE_KEY) {
    opts.authenticator = 'SNOWFLAKE_JWT';
    opts.privateKey = process.env.SNOWFLAKE_PRIVATE_KEY.replace(/\\n/g, '\n');
  } else {
    opts.password = process.env.SNOWFLAKE_PASSWORD;
  }
  const conn = snowflake.createConnection(opts);
  return new Promise((resolve, reject) =>
    conn.connect((err, c) => (err ? reject(err) : resolve(c)))
  );
}

function query(conn, sqlText) {
  return new Promise((resolve, reject) =>
    conn.execute({ sqlText, complete: (err, _s, rows) => (err ? reject(err) : resolve(rows)) })
  );
}

exports.handler = async () => {
  let conn;
  try {
    conn = await connect();
    const rows = await query(
      conn,
      'SELECT YEAR, STATE, TURNOUT_PCT FROM TURNOUT_CLEAN ORDER BY STATE, YEAR'
    );
    const data = rows.map((r) => ({
      year: Number(r.YEAR),
      state: r.STATE,
      turnout: r.TURNOUT_PCT === null ? null : Number(r.TURNOUT_PCT),
    }));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Snowflake query failed', detail: e.message }) };
  } finally {
    if (conn) conn.destroy(() => {});
  }
};
