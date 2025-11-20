
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const url = process.env.MONGO_URL;


mongoose.connect(url, {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
let theName = 'None';

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  email:String,
  password:String,
  fName:String,
  lName:String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get('/home' ,(req,res) => {
  res.render('home',{Title:theName})
  })

app.get('/contact' ,(req,res) => {
    res.render('contact')
    })

app.get('/about' ,(req,res) => {
  res.render('about')
      })
    
app.get('/' ,(req,res) => {
res.render('login')
})
app.get('/app/register' ,(req,res) => {
  res.render('register')
  })

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(itemName);
  const item = new Item({
    name: itemName
  });
  console.log(listName);
  try {
    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({name: listName});
      console.log(foundList);
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + theName);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding an item.");
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    } else {
      const foundList = await List.findOneAndUpdate({name: listName}, { $pull: { items: { _id: checkedItemId } } });
      console.log('the' +listName);
      res.redirect("/" + theName);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while deleting an item.");
  }
});

app.post('/register', async function (req, res) {
  const newUser = new List({
      email: req.body.username, // Change 'username' to 'email'
      password: req.body.password,
      fName:req.body.fName,
      lName:req.body.lName
  });

  try {
      await newUser.save();
      res.redirect('/');
  } catch (err) {
      console.log(err);
  }
});

app.post('/login', async function (req, res) {
  const username = req.body.username; // Change 'username' to 'email'
  const password = req.body.password;

  try {
      const foundUser = await List.findOne({ email: username });
      if (foundUser && foundUser.password === password) {
        theName = foundUser.fName;
        console.log(theName);
        isLogged = true;
        
          res.redirect('/' + foundUser.fName);
         
      }
  } catch (err) {
      console.log(err);
  }
});

app.post('/logout', (req,res)=>{
  res.redirect('/')
  theName = 'None'
})

app.get("/:customListName", async function(req, res) {
  try {
    const customListName = _.capitalize(req.params.customListName);
    const foundList = await List.findOne({name: customListName});
    console.log(theName);
  if(req.params.customListName === theName && theName != 'None'){
    if (!foundList) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/" + theName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    

  }else{
    res.render('404')
  }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while processing the request.");
  }

  
});

app.post('/redirect',(req,res)=>{
  res.redirect('/')
})
app.get('*' , (req,res)=>{
res.render('404')
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
