import express from "express";
const app = express();
const port = 3001;

app.use("/website", express.static("website"));

app.get("/", (req, res) => {
  res.redirect("/website");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
