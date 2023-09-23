const express = require('express');
const mongoose = require('mongoose');
const Rooms = require('./dbRooms');
const cors = require('cors');
const Messages = require('./dbmessages');
const Pusher = require('pusher');

const app = express();

const pusher = new Pusher({
  appId: '1675190',
  key: 'ed68fad6d4e3c7d637e1',
  secret: 'a9c1b3b3151f69cbf6b2',
  cluster: 'ap2',
  useTLS: true,
});

app.use(cors());
app.use(express.json());

const dbUrl =
  'mongodb+srv://whatsappclone:izbDVPTGqgjHyR1F@cluster0.flp2p1u.mongodb.net/whatsappclone?retryWrites=true&w=majority';

mongoose.connect(dbUrl);

const db = mongoose.connection;

db.once('open', () => {
  console.log('Db connected');

  const roomCollection = db.collection('rooms');
  const changeStream = roomCollection.watch();

  changeStream.on('change', (change) => {
    console.log(change);
    if (change.operationType === 'insert') {
      const roomDetails = change.fullDocument;
      pusher.trigger('room', 'inserted', roomDetails);
    } else {
      console.log('Not expected event to trigger');
    }
  });

  const msgCollection = db.collection('messages');
  const changeStream1 = msgCollection.watch();

  changeStream1.on('change', (change) => {
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('message', 'inserted', messageDetails);
    } else {
      console.log('Not expected event to trigger');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Hello from backend');
});

app.get('/room/:id', (req, res) => {
  Rooms.find({ _id: req.params.id }, (err, data) => {
    if (err) {
      return req.status(500).send(err);
    } else {
      return res.status(200).send(data[0]);
    }
  });
});

app.get('/messages/:id', (req, res) => {
  Messages.find({ roomId: req.params.id }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data);
    }
  });
});

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(201).send(data);
    }
  });
});

app.post('/group/create', (req, res) => {
  const name = req.body.groupName;
  Rooms.create({ name }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(201).send(data);
    }
  });
});

app.get('/all/rooms', (req, res) => {
  Rooms.find({}, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data);
    }
  });
});
app.listen(5000, () => {
  console.log('Server is up and running');
});
