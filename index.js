const express = require('express')
const app = express()
// app.get('/', (req, res) => {res.sendStatus(200)})
app.use(express.static('public'));
app.listen(3000, () => console.log('Workbench app listening on 3000...'))
