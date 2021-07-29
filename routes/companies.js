/** Routes about companies.  */
const express = require("express")
const { NotFoundError, BadRequestError } = require("../expressError")

const db = require("../db");
const router = new express.Router();

/** GET / - returns `{companies: [code, name]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT code, name FROM companies");
    const companies = results.rows;
  
    return res.json({ companies });
  });

  /** GET /[id] - return data about one company: `{company: {code, name, description}}` */

router.get("/:code", async function (req, res, next) {
    console.log("WE MADE IT!")
    const code = req.params.code;
    console.log(code);
    
    debugger;
    const results = await db.query(
        "SELECT code, name, description FROM companies WHERE code = $1", [code]);
    
    const company = results.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${code}`);
    
    return res.json({ "company":company });

});



  module.exports = router;