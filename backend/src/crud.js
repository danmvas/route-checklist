import express from "express";
const routes = express.Router();
export default routes;

const routeArray = [];

// name: string;
// checked: boolean;
// latLng: LType.LatLng;

routes.get("/", function (req, res) {
  res.json(routeArray);
  res.end();
});

routes.get("/:index", function (req, res) {
  let index = parseInt(req.params.index);
  res.json(routeArray[index]);
  res.end();
});

routes.post("/", function (req, res) {
  for (let i = 0; i < req.body.length; i++) {
    routeArray.push({
      name: req.body[i].name,
      checked: req.body[i].checked,
      latLng: req.body[i].latLng,
    });
  }
  res.end();
});

routes.patch("/:index", (req, res) => {
  let index = parseInt(req.params.index);

  console.log(req.body[index]);

  let patchName = req.body.name;
  let patchLatlng = req.body.latLng;
  let patchChecked = req.body.checked;

  topatch = routeArray[index];
  topatch.name = parseFloat(patchName);
  topatch.latLng = patchLatlng;
  topatch.checked = patchChecked;

  res.end();
});

routes.delete("/:index", function (req, res) {
  const index = parseInt(req.params.index);
  routeArray.splice(index, 1);
  res.end();
});
