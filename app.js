const express = require('express')
const bodyParser = require('body-parser')
const date = require(__dirname + "/date.js")
const mongoose = require('mongoose')
const _ = require('lodash')

const today = date.getDate()

const app = express()

mongoose.connect('mongodb://localhost:27017/todoListJune21')

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema)

// create default items for to do list
const item1 = new Item ({
  name: "Welcome to your todolist!"
})
const item2 = new Item ({
  name: "Hit the + button to add a new item."
})
const item3 = new Item ({
  name: "<-- Hit the checkbox to delete an item."
})

const defaultItems = [item1,item2,item3]


//database schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})
// database model
const List = mongoose.model('List', listSchema)

// database documents

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs')

app.get("/", function(req, res) {

  Item.find({}, function (err, foundItems) {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err)
        } else {
          console.log("Successfully added items.")
          res.redirect("/")
        }
      })
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  })

})

// get custom routes

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
      // create new list
      console.log("Doesn't exist. Creating new list...")
      const list = new List ({
        name: customListName,
        items: defaultItems
      })

      list.save()
      res.redirect("/" + customListName)
      } else {
        // show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})

app.post("/", function(req,res) {
  const newItem = req.body.newItem
  const listName = req.body.list
  const item = new Item ({
    name: newItem
  })
  if(listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
})

app.post("/delete", function(req,res) {
  const itemId = req.body.checkbox
  const listName = req.body.listName
  console.log(itemId)
  console.log(listName)

  if(listName === "Today") {
    Item.findByIdAndRemove(itemId, function (err) {
      if(!err) {
        console.log("Deleted item.")
      }
    })
    res.redirect("/")
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: itemId}}},
      function (err, foundList) {
        if(!err) {
          res.redirect("/" + listName)
        }
      }
    )
  }

})


app.listen(3000, function() {
  console.log('Server started on Port 3000')
})