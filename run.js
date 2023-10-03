/**
 * Initializes the router for handling run requests.
 * @param {Object} node - The node object.
 * @returns {Object} - The router object.
 */
const init = (node) => {
  /**
   * Handles the run request.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  const run = async (req, res) => {
    console.log("run called");
    let body = req.body;
    const args = {
      ...req.params
    };
    delete args.actionname;
    delete args.pk;
    try {
      const kp = {
        publicKey: Buffer.from(req.params.pk, "hex")
      };
      const sub = node.getSub(kp, req.params.actionname);
      console.log(sub.publicKey.toString("hex"));
      const lbkey = await node.lbfind(sub);
      console.log({
        body: body,
        args: args
      });
      const output = await node.runKey(Buffer.from(lbkey[0], "hex"), body || args, {
        reusableSocket: false
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

  /**
   * Handles the find request.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  const find = async (req, res) => {
    console.log("find called", req.params);
    try {
      const kp = {
        publicKey: Buffer.from(req.params.pk, "hex")
      };
      const sub = node.getSub(kp, req.params.actionname);
      console.log(sub.publicKey.toString("hex"));
      const lbkey = await node.lbfind(sub);
      const found = JSON.stringify(lbkey);
      console.log({
        found: found
      });
      res.write(found);
      res.status(200).end();
    } catch (err) {
      console.log(err);
      res.write(JSON.stringify(err));
      res.status(500).end();
    }
  };

  const router = express.Router();
  router.get("/:pk/:actionname", run);
  router.get("/find/:pk/:actionname", find);
  router.post("/:pk/:actionname", run);
  return router;
};

module.exports = init;