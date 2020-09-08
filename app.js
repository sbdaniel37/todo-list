require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const date = require(__dirname + '/date.js');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
	// 'mongodb://localhost:27017/todolistDB' ||
	'mongodb+srv://' +
		process.env.DB_USER +
		':' +
		process.env.DB_PASS +
		'@todolist.qlmku.mongodb.net/todolistDB?retryWrites=true&w=majority',
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.set('useFindAndModify', false);

const itemsSchema = new Schema({
	name: String
});

const Item = mongoose.model('Item', itemsSchema);

const firstItem = new Item({
	name: 'Welcome to your personal TODO-list!'
});

const secondItem = new Item({
	name: 'Add new items to your list by hitting the + button.'
});

const thirdItem = new Item({
	name: '<-- Hit this to cross off a finished item.'
});

const defaultItems = [ firstItem, secondItem, thirdItem ];

const listSchema = new Schema({
	name: String,
	items: [ itemsSchema ]
});

const List = mongoose.model('List', listSchema);

app.get('/', async (req, res) => {
	const day = date.getDate();

	try {
		Item.find({}, function(err, foundItems) {
			if (err) {
				console.log(err);
			} else {
				if (foundItems.length === 0) {
					Item.insertMany(defaultItems, function(err) {
						if (err) {
							console.log(err);
						} else {
							console.log('Successfully saved the default items!');
						}
					});
					res.redirect('/');
				} else {
					res.render('list', { listTitle: day, items: foundItems });
				}
			}
		});
	} catch (err) {
		console.log(err);
	}
});

app.get('/:listName', async (req, res) => {
	const listName = _.capitalize(req.params.listName);

	try {
		List.findOne({ name: listName }, function(err, foundList) {
			if (!err) {
				if (!foundList) {
					const list = new List({
						name: listName,
						items: defaultItems
					});

					list.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							res.redirect('/' + listName);
						}
					});
				} else {
					res.render('list', { listTitle: foundList.name, items: foundList.items });
				}
			} else {
				console.log(err);
			}
		});
	} catch (err) {
		console.log(err);
	}
});

app.post('/', async (req, res) => {
	const itemName = req.body.item;
	const listName = req.body.list;

	const item = new Item({
		name: itemName
	});

	try {
		if (listName === date.getDate()) {
			await Item.create({
				name: itemName
			});
			res.redirect('/');
		} else {
			List.updateOne({ name: listName }, { $push: { items: item } }, function(err) {
				if (err) {
					console.log(err);
				} else {
					res.redirect('/' + listName);
				}
			});
		}
	} catch (err) {
		console.log(err);
	}
});

app.post('/delete', async (req, res) => {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === date.getDate()) {
		Item.findByIdAndRemove(checkedItemId, function(err) {
			if (err) {
				console.log(err);
			} else {
				res.redirect('/');
			}
		});
	} else {
		List.updateOne({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err) {
			if (err) {
				console.log(err);
			} else {
				res.redirect('/' + listName);
			}
		});
	}
});

app.listen(3000, function() {
	console.log('Server is now running on port 3000.');
});
