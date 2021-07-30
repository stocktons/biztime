/** Routes about companies.  */
const express = require("express")
const { NotFoundError, BadRequestError } = require("../expressError")

const db = require("../db");
const router = new express.Router();

/** GET / - returns `{companies: [{code, name}]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT code, name FROM companies");
    const companies = results.rows;
  
    return res.json({ companies });
  });

  /** GET /[code] - return data about one company: `{company: {code, name, description}, {invoices: [id, ...]}}` */

router.get("/:code", async function (req, res, next) {

    const code = req.params.code;
    
    const cResults = await db.query(
        "SELECT code, name, description FROM companies WHERE code = $1", [code]);
    
    const company = cResults.rows[0];

    const iResults = await db.query(
      `SELECT id
      FROM invoices
      WHERE comp_code = $1
      ORDER BY id`, [code]);
      const invoices = iResults.rows.map(i => i.id);
    // const invoices = iResults.rows.map(i => i.id).sort((a, b) => a - b);

    if (!company) throw new NotFoundError(`No matching company: ${code}`);
    
    return res.json({ company, invoices });
});

/** POST / - create company from data; return `{company: {code, name, description}}` */

router.post("/", async function (req, res, next) {
  // could destructure code, name, description out of req.body... and just use those vars below
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]);
  const company = results.rows[0];

  return res.status(201).json({ 'company': company });
});

/** PUT /[code] - update fields in companies; return `{company: {code, name, description}}` */

router.put("/:code", async function (req, res, next) {

  // delete: this check isn't really isn't necessary because if invalid, it would just hit the 404 message below
  if (!("code" in req.params)) throw new BadRequestError("Not allowed"); 

  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
         SET name=$2, description=$3         
         WHERE code = $1
         RETURNING code, name, description`,
    [code, req.body.name, req.body.description]); // destructure
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ 'company': company });
});

/** DELETE /[code] - delete company, return `{status: "deleted"}` */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ status: "deleted" });
});

  module.exports = router;