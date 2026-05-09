const sql = require('mssql');
require('dotenv').config();

const config = {
  server:   process.env.DB_SERVER   || 'DESKTOP-GEI2GSQ',
  database: process.env.DB_NAME     || 'lgv_db',
  port:     parseInt(process.env.DB_PORT || '1433'),
  user:     process.env.DB_USER     || 'sa',
  password: process.env.DB_PASSWORD || '1234',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅  SQL Server connected to:', config.server, '/', config.database);
  }
  return pool;
}

getPool().catch(err => {
  console.error('❌  DB CONNECT FAILED:', err.message);
  console.error('    → Check DB_SERVER, DB_USER, DB_PASSWORD in your .env file');
});

const db = {
  query: async (sql_text, params = []) => {
    const p = await getPool();
    const request = p.request();
    let i = 0;
    const tsql = sql_text
      // Parameter binding
      .replace(/\?/g, () => { const n=`p${i}`; request.input(n, params[i++]); return `@${n}`; })
      // MySQL→TSQL function conversions
      .replace(/DATE_FORMAT\s*\(([^,]+),\s*'%Y-%m-%d'\s*\)/gi, 'CONVERT(varchar,$1,23)')
      .replace(/\bNOW\s*\(\)/gi, 'GETDATE()')
      // CURDATE() handled directly in SQL Server syntax in route files
      .replace(/DATE_ADD\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, 'DATEADD(DAY,$2,$1)')
      .replace(/\bDATE\s*\(([^)]+)\)/gi, 'CAST($1 AS DATE)')
      // DATEDIFF handled directly in SQL Server syntax in route files
      // Backtick identifiers → square brackets
      .replace(/`([^`]+)`/g, '[$1]')
      // LIMIT N → TOP N  (MySQL→TSQL)
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bLIMIT\s+(\d+)\b/gi, (_, n) => { /* handled below */ return `__LIMIT__${n}`; })
      // INSERT IGNORE → INSERT (SQL Server uses MERGE for that, simplify to ignore constraint errors)
      .replace(/INSERT IGNORE\b/gi, 'INSERT')
      // COALESCE is fine in both, keep
      // VALUES ? (bulk insert array) — not used in mssql driver this way, skip
      ;

    // Now handle LIMIT: move TOP N into SELECT
    const limitMatch = tsql.match(/__LIMIT__(\d+)/);
    let finalSql = tsql;
    if (limitMatch) {
      const n = limitMatch[1];
      finalSql = tsql
        .replace(/__LIMIT__\d+/, '')           // remove placeholder
        .replace(/\bSELECT\b/i, `SELECT TOP ${n}`); // add TOP after SELECT
    }

    const result = await request.query(finalSql);
    return [result.recordset || [], []];
  }
};

module.exports = db;