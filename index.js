var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server.listen(3002))

var Meetup = require('meetup')
var mup = new Meetup()

let topicsCounter = {}


io.on('connection', socket => {
  console.log('got connection')
  socket.emit('action', 'helloPersonyouCanTypeAnythingHere' )
});

//  this thing is recieving everything you stream in mip.stream

  mup.stream('/2/rsvps', stream => {
    stream
      .on('data', (item) => {
        // console.log('got item ' + item)

      const topicNames =
      item.group.group_topics.map(topic => topic.topic_name)

      if (!topicNames.includes('Software Development')) return;
      io.emit('action', item)

      topicNames.forEach( name => {
        if (topicsCounter[name]) {
          topicsCounter[name]++
        }
        else {
          topicsCounter[name] = 1
        }
      })

      const arrayOfTopics = Object.keys(topicsCounter)
      arrayOfTopics.sort((topicA, topicB) => {
        if (topicsCounter[topicA] > topicsCounter[topicB]) {
          return -1
        }
        else if (topicsCounter[topicB] > topicsCounter[topicA]) {
          return 1
        }
        else {
          return 0
        }
      })

      const topTenTopics = arrayOfTopics.slice(0, 10)

      const result = topTenTopics.map(topicName => {
        return {
          topic: topicName,
          count: topicsCounter[topicName]
        }
      })

      console.log('Top 10 Development Feed: ', result)

      io.emit('action', result)

      }).on('error', e => {
        console.log('error! ' + e)
      })
  });
