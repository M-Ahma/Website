const sql = require('mssql');
require('dotenv').config();

const config = {
  server: 'DESKTOP-GEI2GSQ',
  database: 'lgv_db',
  port: 1433,
  user: 'sa',
  password: '1234',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅  SQL Server connected!');
  }
  return pool;
}

getPool().catch(err => {
  console.error('❌  FAILED:', err.message);
});

const db = {
  query: async (sql_text, params = []) => {
    const p = await getPool();
    const request = p.request();
    let i = 0;
    const tsql = sql_text
      .replace(/\?/g, () => { const n=`p${i}`; request.input(n, params[i++]); return `@${n}`; })
      .replace(/DATE_FORMAT\s*\(([^,]+),\s*'%Y-%m-%d'\s*\)/gi, 'CONVERT(varchar,$1,23)')
      .replace(/\bNOW\s*\(\)/gi, 'GETDATE()')
      .replace(/\bCURDATE\s*\(\)/gi, 'CAST(GETDATE() AS DATE)')
      .replace(/DATE_ADD\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, 'DATEADD(DAY,$2,$1)')
      .replace(/\bDATE\s*\(([^)]+)\)/gi, 'CAST($1 AS DATE)')
      .replace(/`([^`]+)`/g, '[$1]')
      .replace(/\bLIMIT\s+1\b/gi, '');
    const result = await request.query(tsql);
    return [result.recordset || [], []];
  }
};

module.exports = db;