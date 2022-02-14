const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition fee']
  },
  minimumSkill: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please add a minimum skill']
  },
  scholarshipAvailable: {
    type: Boolean,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

/**
 * Static method to get avg of course tuitions
 */
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  console.log('calculating average cost...'.yellow.inverse);

  const average = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: {
      _id: '$bootcamp',
      averageCost: { $avg: '$tuition' }
    }}
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(average[0].averageCost / 10) * 10
    })
  }
  catch(err) {
    console.error(err);
  }
}

/**
 * Call getAverageCost after saving
 */
CourseSchema.post('save', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

/**
 * Call getAverageCost before remove
 */
 CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);