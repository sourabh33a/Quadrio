import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from 'dotenv';
import { Com } from "./models/company.js";
import { Feed } from "./models/company.js";
import { Item } from "./models/company.js"; 
dotenv.config();

let conn = await mongoose.connect(process.env.DB_URL);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/register', async (req, res) => {
    res.render('register');
});
app.get('/', async (req, res) => {
    res.render('landing');
});
app.get('/index', async (req, res) => {
    res.render('index');
});

app.get('/forgot', async (req, res) => {
    res.render('forgot');
});
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await Com.findOne({ name: username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        const newUser = new Com({ name: username, email: email, password: password, role: role || 'user' });
        await newUser.save();

        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});
app.post('/logins', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Com.findOne({ name: username, password: password });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('landing');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});
app.post('/forgot', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await Com.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found'); 
        }

        user.password = newPassword;
        await user.save();

        res.send('Password updated successfully');
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Error updating password');
    }
 });
 app.post('/feedsubmit', async (req, res) => {
    try {
        const { username, email, feedbackTextArea } = req.body;

        const existingUser = await Com.findOne({ name: username });
        if (existingUser) {
            const newUser = new Feed({ name: username, email: email, text: feedbackTextArea });
            await newUser.save();
            res.send('Your feedback has been submitted successfully');
        } else {
            res.send('Enter a valid Registered username');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});
const isAdmin = async (req, res, next) => {
    try {
        const { username } = req.body;
        const user = await Com.findOne({ name: username });

        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).send('You are not authorized to perform this action');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).send('Internal server error');
    }
};
app.post('/add-item', isAdmin, async (req, res) => {
    try {
        const { itemname,itemdescription,username } = req.body;

        const existingUser = await Com.findOne({ name: username });
        if (existingUser) {
            const newItem = new Item({ name: itemname,  text: itemdescription });
            await newItem.save();
            res.redirect('/');
        } else {
            res.send('You are not authorized to add Items');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).send('Error adding item');
    }
});
app.post('/delete-item', isAdmin, async (req, res) => {
    try {
      const { itemname, username } = req.body;
  
      // Check if the user exists and is authorized
      const existingUser = await Com.findOne({ name: username });
      if (existingUser) {
        // Delete the item by itemname
        const result = await Item.deleteOne({ name: itemname });
        if (result.deletedCount === 1) {
            res.redirect('/');
        } else {
          res.send('No item found with the provided name');
        }
      } else {
        res.send('You are not authorized to delete items');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).send('Error deleting item');
    }
  });
  app.get('/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    } 
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 