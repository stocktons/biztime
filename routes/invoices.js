/** Routes about invoices.  */
const express = require("express")
const { NotFoundError, BadRequestError } = require("../expressError")

const db = require("../db");
const router = new express.Router();

/** GET / - returns `{invoices: [{id, comp_code}]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT id, comp_code FROM invoices");
    const invoices = results.rows;

    return res.json({ invoices });
});

/** GET /[id] - return data about one invoice: 
 * `{invoice: {id, amt, paid, add_date, paid_date}, 
 * company: {code, name, description}}` */

router.get("/:id", async function (req, res, next) {

    const id = req.params.id;
    const iResults = await db.query(
        `SELECT id, comp_code, amt, paid, add_date, paid_date
        FROM invoices
        WHERE id = $1`, [id]);
    const comp_code = iResults.rows[0].comp_code;
    const invoice = { ...iResults.rows[0], comp_code: undefined };

    const cResults = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [comp_code]);
    const company = cResults.rows[0];

    // our original solution: okay, but not as compact
    // const cResults = await db.query( 
    //     `SELECT code, name, description
    //     FROM companies
    //     JOIN invoices
    //     ON invoices.comp_code = companies.code
    //     WHERE invoices.id = $1`, [id]);
    // const company = cResults.rows[0];

    return res.json({ invoice, company });
});

/** POST / - create invoice from data; return `{invoice: {id, comp_code, 
 * amt, paid, add_date, paid_date}}` */

router.post("/", async function (req, res, next) {
  const { comp_code, amt } = req.body;
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);
  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
});

/** PUT /[id] - update amount field in an invoice; return `{invoice: {id, comp_code, 
 * amt, paid, add_date, paid_date}}` */

router.put("/:id", async function (req, res, next) {

  const id = req.params.id;
  const results = await db.query(
    `UPDATE invoices
         SET amt=$2        
         WHERE id = $1
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [id, req.body.amt]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ invoice });
});

/** DELETE /[id] - delete invoice, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;
  const results = await db.query(
    "DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ status: "deleted" });
});

module.exports = router;