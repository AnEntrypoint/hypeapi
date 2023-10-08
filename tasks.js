const express = require('express')
/**
 * Initializes the router for handling tasks requests.
 * @param {Object} node - The node object.
 * @returns {Object} - The router object.
 */
const init = (node) => {
  /**
   * Handles the save task request.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  const saveTask = async (req, res) => {
    console.log(req);
    fs.writeFileSync(`saves/${req.params.name}.json`, JSON.stringify(req.body));
    res.write("{success:true}");
    res.status(200).end();
  };

  /**
   * Handles the load task request.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  const loadTask = async (req, res) => {
    console.log("loading task");
    try {
      const name = `saves/${req.params.name}.json`;
      res.write(fs.readFileSync(name));
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.write(JSON.stringify({
        error: e
      }));
      res.status(500).end();
    }
  };

  /**
   * Handles the run task request.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  const runTask = async (req, res) => {
    console.log("run called");
    var params = req.params;
    let body = req.body,
      pk = req.params.pk;
    const args = {
      ...req.params
    };
    console.log({
      body: body,
      args: args
    });
    delete args.actionname;
    delete args.pk;
    try {
      console.log("running", pk, params);
      const kp = {
        publicKey: Buffer.from(pk, "hex")
      };
      const lbkey = await node.lbfind(kp, "task");
      const output = await node.runKey(Buffer.from(lbkey[0], "hex"), {
        name: req.params.actionname,
        pk: req.params.pk,
        params: body || args
      });
      console.log("output:", output);
      if (typeof output == "object")
        res.write(JSON.stringify(output));
      else if (typeof output == "string")
        res.write(output);
      res.status(200).end();
    } catch (err) {
      res.write(JSON.stringify(err));
      res.status(500).end();
    }
  };

  const router = express.Router();
  router.get("/load/:name", loadTask);
  router.post("/run/:pk/:actionname", runTask);
  router.post("/save/:name", saveTask);
  return router;
};

module.exports = init;