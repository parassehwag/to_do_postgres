import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "toDO",
  password: "Paras@2002"
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function getItems(){
  let result=[];
  try{
    result = await db.query("SELECT * from toDoList");
    if(result.length==0){
      return 0;
    }
    return result.rows;
  }catch(error){
    console.log(error);
  }
}

app.get("/", async(req, res) => {
  items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  if (!item || item.trim() === '') {
    return res.redirect("/");
  }
  try{
    await db.query("INSERT INTO toDoList (title) VALUES ($1)",[item]);
  }catch(error){
    console.log(error);
  }finally{
    res.redirect("/");
  }
});

app.post("/edit", async(req, res) => {
  let targetId=req.body.updatedItemId;
  let updatedItemTitle = req.body.updatedItemTitle;
  if(!targetId){
    return res.redirect("/");
  }
  try{
    await db.query("UPDATE toDoList SET title =$1 WHERE id = $2 ",[updatedItemTitle,targetId]);
  }catch(error){
    console.log(error);
  }finally{
    res.redirect("/");
  }
});

app.post("/delete", async(req, res) => {
  let targetId=req.body.deleteItemId;
  if(!targetId){
    return res.redirect("/");
  }
  try{
    await db.query("DELETE FROM toDoList WHERE id = $1",[targetId]);
  }catch(error){
    console.log(error);
  }finally{
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
