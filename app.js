var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
//Tambahkan modul jsonwebtoken
const jwt = require("jsonwebtoken");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//gunakan body parser sebagai middleware
app.use(bodyParser.json())
//data yang kita gunakan adalah kelas pada karakter game
var kelas = [
    { id: 1, nama_kelas: "Backend"},
    { id: 2, nama_kelas: "Frontend"},
    { id: 3, nama_kelas: "Fullstack"},
]

app.get('/api/kelas', function (req, res) {
    res.json({data: kelas})
    res.send({data: kelas})
})

app.get('/api/kelas/:id', function (req, res) {
    const kls = kelas.find(k => k.id === parseInt(req.params.id))
    if (!kls) res.status(404).send("kelas tidak ditemukan") //tampilkan status 404
    res.json({data: kls})
    res.send({data: kls})
})

//menambahkan data
app.post('/api/kelas', function(req, res) {
    //kondisi apabila nama kelas kosong
    if (!req.body.nama_kelas) {
        //menampilkan pesan error ketika field nama kelas kosong
        res.status(400).send("Nama kelas harus diisi")
        return
    }

    const kls = {
        id: kelas.length + 1,
        nama_kelas: req.body.nama_kelas
    }
    kelas.push(kls)
    res.send(kls)
})

//mengupdate daata
app.put('/api/kelas/:id', function(req, res) {
    //cek id kelas
    const klas = kelas.find(k => k.id === parseInt(req.params.id))
    if(!klas) res.status(404).send("kelas tidak ditemukan")

        if(!req.body.nama_kelas) {
            //menampilkan pesan error ketika field nama kelas kosong
            res.status(400).send("Nama kelas harus diisi")
            return
        }

        klas.nama_kelas = req.body.nama_kelas
        res.send({pesan: "Data berhasil diupdate", data: klas})
})

//menghapus data
app.delete('/api/kelas/:id', function(req,res) {
    //cek id kelas
    const klas = kelas.find(k => k.id === parseInt(req.params.id))
    if (!klas) res.status(404).send("Kelas tidak ditemukan")

        const index = kelas.indexOf(klas)
        kelas.splice(index, 1)
        res.send({pesan: "Data berhasil dihapus", data: klas})
})

//auth jwt
app.post('/api/login', (req, res) => {
    const user = {
        id:Date.now(),
        userEmail:'admin@gamelab.id',
        password:'gamelab'
    }
    //untuk generate token user
    jwt.sign({ user },'secretkey',(err,token)=>{
        res.json({
            token
        })
    })
})



app.get('/api/profile', verifyToken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            res.sendStatus(403)
        else{
            res.json({
                message:"Selamat Datang di Gamelab Indonesia",
                userData:authData
            })
        }
    })
})

//Verifikasi Token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    //cek jika bearer kosong/tidak ada
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      //Get token
      const bearerToken = bearer[1];
  
      //set the token
      req.token = bearerToken;
  
      //next middleware
      next();
    } else {
      //Jika tidak bisa akses mengarahkan ke halaman forbidden
      res.sendStatus(403);
    }
}
  
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
