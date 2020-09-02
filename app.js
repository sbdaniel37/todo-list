const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');

const app = express();

const items = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
	const day = date.getDate();

	try {
		res.render('list', { listTitle: day, items: items });
	} catch (err) {
		console.log(err);
	}
});

app.get('/work', async (req, res) => {
	try {
		res.render('list', { listTitle: 'Work List', items: workItems });
	} catch (err) {
		console.log(err);
	}
});

app.post('/', async (req, res) => {
	const item = req.body.item;

	try {
		if (req.body.list === 'Work List') {
			workItems.push(item);
			res.redirect('/work');
		} else {
			items.push(item);
			res.redirect('/');
		}
	} catch (err) {
		console.log(err);
	}
});

app.listen(3000, function() {
	console.log('Server is now running on port 3000.');
});
