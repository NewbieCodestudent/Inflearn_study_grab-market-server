const express = require('express');
const cors = require('cors');
const app = express();
const models = require('./models');
const multer = require('multer');

const upload = multer({
  storage : multer.diskStorage({
    // 이미지 파일경로 설정
    destination : function(req,file,cd) {
      cd(null, 'uploads/');
    },
    // 이미지 파일 이름 설정
    filename : function(req,file,cd){
      cd(null, file.originalname);
    }
  })
});
// heroku 서버에 업로드할때 포트를 받아오기 위한 코드
const port = process.env.PORT || 8090;

app.use(express.json());
app.use(cors());
// 업로드 후 경호가 계속 이어지도록 하는 것
app.use('/uploads',express.static('uploads'));

// selectALl
app.get('/products',(req,res)=>{
  models.Product.findAll({
    // 출력되는 갯수를 정하는 부분...
    limit : 100,
    // 정렬기준 부여
    order : [['createdAt','DESC']],
    attributes : ['id','name','price','createdAt','seller','imageUrl', 'soldout']
  }).then((result)=>{
    console.log("PRODUCTS : ", result);
    res.send({
      products : result
    })
  }).catch((error)=>{
    console.error(error);
    res.status(400).send("에러발생");
  })
})

// insert
app.post('/products',(req,res)=>{
  console.log("진입");
  const body = req.body;
  console.log(body);
  const {name, description, price, seller, imageUrl} = body;
  if(!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 입력해주세요!");
  }
  models.Product.create({name, description, price, seller, imageUrl})
    .then((result)=>{
      console.log("상품생성결과:",result);
      res.send({
        result
      });
    })
    .catch((error)=>{
      console.error(error);
      res.status(400).send("상품 업로드에 문제가 발생하였습니다...");
    });
})

// selectOne
app.get("/products/:id", (req,res) => {
  const params = req.params;
  const {id} = params;
  models.Product.findOne({
    // where 조건을 주는 부분
    where : {
      id : id
    }
  }).then((result)=>{
    console.log("PRODUCT:",result);
    res.send({
      product : result
    })
  }).catch((error)=>{
    console.error(error);
    res.status(400).send("상품 조회에 에러가 발생하였습니다.");
  })
})

// 서버 연결
app.listen(port,()=>{
  console.log("그랩의 쇼핑몰이 돌아가고 있습니다.");
  models.sequelize.sync().then(()=>{
    console.log("DB 연결 성공!");
  }).catch((err)=>{
    console.error(err);
    console.log('DB 연결 에러');
    process.exit();
  })
})

// 이미지 파일 처리하는 API
// single은 이미지 한개를 처리
app.post('/image', upload.single('image'),(req,res)=>{
  const file = req.file;
  console.log(file);
  // file내 정보
  /*
    fieldname: 'image',
    originalname: 'basketball3.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'uploads/',
    filename: 'basketball3.jpg',
    path: 'uploads\\basketball3.jpg',
    size: 197980
  */
  res.send({
    imageUrl : file.path
  });
});

// 배너 관리
app.get('/banners',(req,res)=>{
  models.Banner.findAll({
    limit : 2
  }).then((result)=>{
    res.send({
      banners : result
    });
  }).catch((error)=>{
    console.log(error);
    res.status(500).send("에러가 발생했습니다.");
  })
})

// 결제
app.post("/purchase/:id", (req,res) => {
  const {id} = req.params;
  models.Product.update(
    {
      soldout : 1
    },{
      where : {id}
    }
  ).then((result) => {
    res.send({
      result : true
    });
  }).catch((error) => {
    console.error(error);
    res.status(500).send("에러가 발생했습니다.");
  })
});