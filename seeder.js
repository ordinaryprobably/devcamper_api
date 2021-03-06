const fs = require('fs');
const colors = require('colors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

// Models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/course');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

// Import the JSON files to DB
const importData = async function() {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);

    console.log('Data from ./_data has been imported...'.blue.inverse);;
    process.exit();
  }
  catch(err) {
    console.error(err);
  }
}

// Delete Data
const deleteData = async function() {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    console.log('Data has been destroyed...'.red.inverse);
    process.exit();
  }
  catch(err) {
    console.error(err);
  }
}

if(process.argv[2] === 'import') {
  importData();
} else if(process.argv[2] === 'delete') {
  deleteData();
}