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



module.exports = router;