/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  firebase  = require('firebase'),
  Promise = require('promise');

  var app = express();
  app.set('port', process.env.PORT || 5000);
  app.set('view engine', 'ejs');
  app.use(bodyParser.json({ verify: verifyRequestSignature }));
  app.use(express.static('public'));

  // Firebase Var Initialisation

  const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
  const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN;
  const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL;
  const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

  var firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DB_URL,
    storageBucket: FIREBASE_STORAGE_BUCKET,
  };

  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();

  var firstName = "";

  var cnt;

  // Time Delay variable
  var delayMills = 1000;
  var reviewCounter = 0;

  var specialWords = ['location','located','reviews','review','photo','photos','hours','hour'];

  var images = [
    'https://b.zmtcdn.com/data/pictures/2/1600222/a6729204721ae5119b82db3b806f8fa7.jpg',
    'https://b.zmtcdn.com/data/pictures/2/1600222/898675fe6f3c388fda4d49ee445fda2f.jpg',
    'https://b.zmtcdn.com/data/pictures/chains/2/1600222/1797d9d2bbf2f47b636bd0ec436c82c4.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/246/46a8e1a27f7886cc37013135fd310246_1488455154.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/ed0/1f6a9832e191bd9c356b4cc3b8333ed0_1486206060.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/cc1/87791a69c64e3b31c259af164e730cc1_1483162448.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/02b/ab70ccc531c0b312e920b39a1a73702b_1485409387.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/25d/f432a7cec64c943b086b41c6d269825d_1483162346.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/119/440e8a0a94389499dda34e7052768119_1483017224.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/80e/4ae1976d6e22b15307830f1fc83f780e_1483017225.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/eda/ee8d0bcee5fe0de7a06f1d33107c6eda_1481917647.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/134/9e6cfce523648731e8c5c4260ba72134_1482327408.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/9cc/fb15a3ea17cc2740e961ecb5bb7d49cc_1482470795.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/05a/4de2fcd6ca6a5c4dc93c7b0579baa05a_1480875055.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/728/e4095ed6052012c6d36e0268578ae728_1478194292.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/f79/6b4bfac0fce91ebc9d63457b9124df79_1478096867.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/19a/12aa70700d327e60341ba2d8c5e0719a_1473150712.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/5e5/f9afd8ab7b329938a317d83e064f45e5_1476805518.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/23f/8cb8ca1490de559a8205d41d2a3be23f_1478096866.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/932/d90d58996014c98c3c761bad08cc0932_1471597439.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/047/5761e96dd432c4b1afc673d7ab525047_1472895228.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/33d/685f2584bfaa688378038220849b233d_1471516748.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/988/5de843c5d0ae4d7d50d68e17f54b3988_1470502288.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/71e/8708a2bfd91daf96b549bec1daff771e_1471156073.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/a29/d1c756d863e4918500478bf733de4a29_1469888901.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/633/840c9ff3b8497fceacc3636739ca9633_1468643524.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/8e4/0bc94e9c882615764c57bc74cc01f8e4_1468733576.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/d93/1a9bbf19f7b79b845d9eec6639824d93_1468733579.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/31b/13b2563ad5e62e358eee7786162cf31b_1465739731.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/37c/c598d8bd021d8d2a699c931f0b18937c_1468643523.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/a50/e593b1b6c3e3536b8c4cca6c2b3b4a50_1467297385.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/264/7a630a09ced182963f3600007653d264_1465739743.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/827/c804c54738280cc15f6f0395a1603827_1465739736.jpg',
    'https://b.zmtcdn.com/data/reviews_photos/fff/bee3c3ac1e6719bc93804b5c05917fff_1465739734.jpg'
  ];
  /*
    App Constants
  */

  // App Secret can be retrieved from the App Dashboard
  const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
    process.env.MESSENGER_APP_SECRET :
    config.get('appSecret');

  // Arbitrary value used to validate a webhook
  const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('validationToken');

  // Generate a page access token for your page from the App Dashboard
  const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

  // URL where the app is running (include protocol). Used to point to scripts and 
  // assets located at this address. 
  const SERVER_URL = (process.env.SERVER_URL) ?
    (process.env.SERVER_URL) :
    config.get('serverURL');

  /*
  * Menu, Reviews, MenuItems Array Declaration
  */  

  var reviews = [
    "Abhay Shingi\nSmall little cosy place to indulge in your chocolate fantasy. The owner is really sweet and heart warming person making sure you are having a good time here.",
    "Prajakta Gosavi\nThis is my favorite burger place though its famous for chocolate. The chocolate shot are a must try too. Place is small. Rates are a bit high comparatively. But once you taste the food here its worth it.",
    "Rashmi Munot\nThe best hub for chocolate lovers ; The Chocolate Room tops my list . Amazing sandwiches and pizzas , and all the chocolate delicacies are mouth watering.",
    "Jay Aher\nThe chocolate just melts in the mouth...just a chocolicious experience...couldn't ask for more...keep going...loved it...just meant for chocolate lovers❤❤"  
  ];

  var menuImages = [
    SERVER_URL + "/assets/images/menu1/menu11.jpg",
    SERVER_URL + "/assets/images/menu2/menu21.jpg",
    SERVER_URL + "/assets/images/menu3/menu31.jpg",
    SERVER_URL + "/assets/images/menu4/menu41.jpg",
    SERVER_URL + "/assets/images/menu5/menu51.jpg",
    SERVER_URL + "/assets/images/menu6/menu61.jpg",
    SERVER_URL + "/assets/images/menu7/menu71.jpg",
    SERVER_URL + "/assets/images/menu8/menu81.jpg",
    SERVER_URL + "/assets/images/menu9/menu91.jpg"
  ];

  /*var items = {
    "italian":[
    {"title":"Classic","image_url":SERVER_URL + "/assets/images/food11/food11.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mint","image_url":SERVER_URL + "/assets/images/food11/food12.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hazelnut","image_url":SERVER_URL + "/assets/images/food11/food13.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Tiramisu","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Torroncino","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Caramel","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Dark","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Belgian Chilli Chocolate","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hot Chocolate with Crunchy Magic Balls","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hot Chocolate with Marshmallows","image_url":SERVER_URL + "/assets/images/food11/food14.jpg","subtitle":"Cuddle cup - 109, Warming Mug - 159","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}  
    ],
    "chocshakes":[
    {"title":"Kit kat shake","image_url":SERVER_URL + "/assets/images/food21/food21.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Oreo cookie shake","image_url":SERVER_URL + "/assets/images/food21/food22.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Black forest shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Toblerone shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Cookie & creame shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Dutch truffle cake shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"189/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Snicker bar shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mars bar shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"M & M shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"TCR's in house shake","image_url":SERVER_URL + "/assets/images/food21/food23.jpg","subtitle":"229/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "choctails":[
    {"title":"Classic chocolate granite","image_url":SERVER_URL + "/assets/images/food31/food31.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mint split latte","image_url":SERVER_URL + "/assets/images/food31/food32.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hazelnut granite","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Tiramisu choctail","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Caramel frappe","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"White choctail","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Dark choctail","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Coffee nirvana","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Torroncino shake","image_url":SERVER_URL + "/assets/images/food31/food33.jpg","subtitle":"169/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "coffee":[
    {"title":"Espresso coffee","image_url":SERVER_URL + "/assets/images/drink11/drink11.jpg","subtitle":"49/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Long black","image_url":SERVER_URL + "/assets/images/drink11/drink12.jpg","subtitle":"69/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Macchiato","image_url":SERVER_URL + "/assets/images/drink11/drink13.jpg","subtitle":"89/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Coppuccino","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"89/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Latte","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"89/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Caramel Macchiato","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Cafe mocha","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Cookie crumble","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hazelnut delight","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mugguccino","image_url":SERVER_URL + "/assets/images/drink11/drink14.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}  
    ],
    "mocktails":[
    {"title":"Cremosinas/Soda","image_url":SERVER_URL + "/assets/images/drink21/drink21.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Granita","image_url":SERVER_URL + "/assets/images/drink21/drink22.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mojito","image_url":SERVER_URL + "/assets/images/drink21/drink23.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Iced Tea","image_url":SERVER_URL + "/assets/images/drink21/drink23.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Fruit Frappers","image_url":SERVER_URL + "/assets/images/drink21/drink23.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "savouries":[
    {"title":"French fries","image_url":SERVER_URL + "/assets/images/drink31/drink31.jpg","subtitle":"89/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Masala fries","image_url":SERVER_URL + "/assets/images/drink31/drink32.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Potato Wedges","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Veg Burger","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Corn N Chilli garlic bread","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Cheesy garlic bread","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "chocizza":[
    {"title":"Choc-Date pizza","image_url":SERVER_URL + "/assets/images/drink31/drink31.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Hi fibre pizza","image_url":SERVER_URL + "/assets/images/drink31/drink32.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Rocky road pizza","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Banana marshmallow chocizza","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Choco ecstassy surprise","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "sundaes":[
    {"title":"Choc-Fudge","image_url":SERVER_URL + "/assets/images/drink31/drink31.jpg","subtitle":"139/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate molten pudding sundae","image_url":SERVER_URL + "/assets/images/drink31/drink32.jpg","subtitle":"149/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate lava java","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"179/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate rocher sundae","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"179/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mousse made of pure chocolate","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate chocolate sundae","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Mt. Brownie","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"199/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate mess","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"229/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Chocolate avalanche","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"239/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "fondue":[
    {"title":"Chocolate Fondue: Dark/White/Milk","image_url":SERVER_URL + "/assets/images/drink31/drink31.jpg","subtitle":"349/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Cheese Fondue","image_url":SERVER_URL + "/assets/images/drink31/drink32.jpg","subtitle":"399/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ],
    "frozen":[
    {"title":"Iced/Diet coffee","image_url":SERVER_URL + "/assets/images/drink31/drink31.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Iced Coppuccino","image_url":SERVER_URL + "/assets/images/drink31/drink32.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Iced cafe americano","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"99/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Coffee frappe","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"109/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Irish coffee","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Almond coffee","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Triple sec coffee","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Tcr's coffee","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"},
    {"title":"Iced Caramel Macchiato","image_url":SERVER_URL + "/assets/images/drink31/drink33.jpg","subtitle":"129/-","default_action_url":"https://www.zomato.com/hyderabad/chilis-banjara-hills","payload_back":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU","payload_review":"DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW"}
    ]
  }*/

  var serviceHighlights = "Our Service Highlights\n- Home Delivery\n- Full Bar Available\n- Live Music\n- Smoking Area\n- Wifi\n- Live Sports Screening\n- Valet Parking Available\n- Featured in Collection\n- Happy hours";
  var testimonials = "Awesome restaurant and great food with warm service!\nCuisines\nDesserts, Cafe, Fast Food";
  var knowFor = "Known For\nSignature Margaritas, American portions and music";

/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

console.log("validation token " + VALIDATION_TOKEN + " PAGE_ACCESS_TOKEN : " + PAGE_ACCESS_TOKEN);

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    receivedQuickReplyPostback(event);
    return;
  }

  if (messageText) {
    messageText = messageText.toLowerCase();

    for(var i = 0; i<specialWords.length; i++){
      var n = messageText.indexOf(specialWords[i]);
      if(n != -1){
        messageText = specialWords[i];
        console.log("what is msgtext : " + messageText);
        break;
      }
    }

    console.log("swith case text: " + messageText);
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {    
      case 'menu':
        sendTypingOn(senderID);
        sendMainMenu(senderID);
      break;       
      case 'opening hours':
        sendTypingOn(senderID);
        sendOpeningHoursText(senderID);
      break;   
      case 'hours':
        sendTypingOn(senderID);
        sendOpeningHoursText(senderID);
      break;
      case 'hour':
        sendTypingOn(senderID);
        sendOpeningHoursText(senderID);
      break;
      case 'reviews':
        sendTypingOn(senderID);
        showReviews(senderID);
      break;      
      case 'review':
        sendTypingOn(senderID);
        showReviews(senderID);
      break;
      case 'location':
        sendTypingOn(senderID);
        sendLocationTemplate(senderID);
      break;
      case 'our location':
        sendTypingOn(senderID);
        sendLocationTemplate(senderID);
      break;
      case 'located':
        sendTypingOn(senderID);
        sendLocationTemplate(senderID);
      break;
      case 'photos':
        sendTypingOn(senderID);
        showPhotos(senderID);
      break;
      case 'photo':
        sendTypingOn(senderID);
        showPhotos(senderID);
      break;
      default:
        sendTypingOn(senderID);
        sendWelcomeMessage(senderID);

        setTimeout(function(){    
            showTextTemplate(senderID,"Hi, We'r happy to see u back..");
          },delayMills);     
    }
  } else if (messageAttachments) {
    sendTypingOn(senderID);
    sendWelcomeMessage(senderID);
    /*setTimeout(function(){    
      sendQuickReplySpecial(senderID);
    },delayMills);*/
  }
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

/*
 * Quick Reply Postback Event
 *
 * This event is called when a postback is tapped on a Quick Reply. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */

function receivedQuickReplyPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var message = event.message;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var quickReply = message.quick_reply;
  var payload = quickReply.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

   if (payload) {
    // If we receive a text payload, check to see if it matches any special
    switch (payload) {
        case 'DEVELOPER_DEFINED_PAYLOAD_REVIEWS':
          sendTypingOn(senderID);
          showReviews(senderID);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_START_OVER':
          sendTypingOn(senderID);
          sendWelcomeMessage(senderID);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_MENU':
          sendTypingOn(senderID);
          sendMainMenu(senderID);
        break;
        default:
        sendTypingOn(senderID);
        sendWelcomeMessage(senderID);
    }
  }else if(user != null){
    if(user.isOrderInProgress)
      showOrderContinuationForm(user.fbId);
    return;
  }else{
    sendTypingOn(senderID);
    sendWelcomeMessage(senderID);
  }
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

   if (payload) {
    // If we receive a text payload, check to see if it matches any special
    switch (payload) {
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_MENU':
          sendTypingOn(senderID);
          sendMainMenu(senderID);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_LOCATION':
          sendTypingOn(senderID);
          sendLocationTemplate(senderID);
/*
          setTimeout(function(){    
            sendQuickReplySpecial(senderID);
          },delayMills);*/
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_OPENING_HOURS':
          sendTypingOn(senderID);
          sendOpeningHoursText(senderID);

          /*setTimeout(function(){    
            sendQuickReplySpecial(senderID);
          },delayMills);*/
          break;
        case 'GET_STARTED_BUTTON_PAYLOAD':
          console.log("Received postback for get started button");

          //sendTypingOn(senderID);

          getUserInfo(senderID,function(){
            if(firstName != ""){              

              var greetText = "Hello " + firstName + ", welcome to The Chocolate Room!\nCheck out what we have to offer by clicking any of the following menus.";

              showTextTemplate(senderID,greetText);
              setTimeout(function(){
                sendWelcomeMessage(senderID);
              },delayMills);
            }else{
               sendWelcomeMessage(senderID); 
            }
          });          
        break;        
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK':        
          sendTypingOn(senderID);
          sendWelcomeMessage(senderID);
        break;        
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_REVIEW':
          sendTypingOn(senderID);
          var x = Math.floor((Math.random() * 4) + 0);
          showTextTemplate(senderID,reviews[x]);
          setTimeout(function(){                
            sendQuickRepliesActions(senderID);
          },delayMills);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_ITALIAN':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[0]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCSHAKES':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[1]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCTAILS':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[2]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_COFFEE':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[3]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_MOCKTAILS':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[4]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_SAVOURIES':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[5]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCIZZA':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[6]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_SUNDAES':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[7]);
        break;
        case 'DEVELOPER_DEFINED_PAYLOAD_FOR_FONDUE':
          sendTypingOn(senderID);
          sendImageMessage(senderID,menuImages[8]);
        break;
        default:
        sendTypingOn(senderID);
        sendWelcomeMessage(senderID);
    }
   }else{
        sendTypingOn(senderID);
        sendWelcomeMessage(senderID);
   }
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

var getUserInfo = function (recipientId,callback) {
  var uri = 'https://graph.facebook.com/v2.6/' + recipientId;
  request({
    uri: uri,
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'GET'
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("user profile body : " + body);
      var jsonObject =  JSON.parse(body);
      firstName = jsonObject.first_name;
      saveUserToFirebase(recipientId,firstName,jsonObject.last_name);      
      callback();
    } else {
      firstName = "";
      callback();
      console.error("Failed calling User Profile API", response.statusCode, response.statusMessage, body.error);
    }
  });  
};

function saveUserToFirebase(recipientId,firstName,last_name){
  database.ref('users/' + recipientId).set({
    userId : recipientId,
    firstName : firstName,
    lastName : last_name
  });
}
/*
 * Send a text message using the Send API.
 *
 */
function sendWelcomeMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {        
      attachment:{
        type:"template",
        payload:{
          template_type:"generic",
          elements:[
             {
              title:"Welcome to The Chocolate Room",
              image_url:SERVER_URL + "/assets/images/tcr.jpg",
              subtitle:"Try Desserts and Bakes",              
              buttons:[
                {
                  type:"postback",
                  title:"Menu",
                  payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU"
                },
                {
                  type:"postback",
                  title:"Our Location",
                  payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_LOCATION"
                },
                {
                    type:"postback",
                    title:"Opening Hours",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_OPENING_HOURS"
                }          
              ]      
            }
          ]
        }    
      }
    }
  };

  callSendAPI(messageData);
}

// This send main menu
function sendMainMenu(recipientId){

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {        
      attachment:{
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Italian Hot Chocolates",
            subtitle: "Enjoy Hot Chocolates",               
            image_url: SERVER_URL + "/assets/images/menu1/menu1.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_ITALIAN",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Chocshakes",
            subtitle: "Enjoy Chocshakes",               
            image_url: SERVER_URL + "/assets/images/menu2/menu2.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCSHAKES",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Choctails",
            subtitle: "Enjoy Choctails",               
            image_url: SERVER_URL + "/assets/images/menu3/menu3.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCTAILS",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Coffee, Tea & Frozen coffee",
            subtitle: "Enjoy Frozen coffee",               
            image_url: SERVER_URL + "/assets/images/menu4/menu4.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_COFFEE",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Mocktails & Belgian Frappe",
            subtitle: "Enjoy Mocktails & Belgian Frappes",               
            image_url: SERVER_URL + "/assets/images/menu5/menu5.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MOCKTAILS",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Pizza, Savouries & Sandwiches",
            subtitle: "Enjoy Pizza, Savouries",               
            image_url: SERVER_URL + "/assets/images/menu6/menu6.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_SAVOURIES",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Chocizza, Pastries & Deserts",
            subtitle: "Enjoy Chocizza, Pastries",               
            image_url: SERVER_URL + "/assets/images/menu7/menu7.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_CHOCIZZA",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Sundaes",
            subtitle: "Enjoy Sundaes",               
            image_url: SERVER_URL + "/assets/images/menu8/menu8.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_SUNDAES",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          },{
            title: "Chocolate Fondue",
            subtitle: "Enjoy Chocolate Fondue",               
            image_url: SERVER_URL + "/assets/images/menu9/menu9.jpg",
            buttons: [{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_FONDUE",
              title: "Explore"
            },{
              type:"phone_number",
              title:"Call",
              payload:"+919930822203"
            },{
              type: "postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_MAIN_MENU_BACK",
              title: "Back"
            }]
          }]
        }
      }
    }    
  };

  callSendAPI(messageData);
}

function sendLocationTemplate(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment:{
        type:"template",
        payload:{
          template_type: "generic",
          elements:[
          {
            title:"The Chocolate Room",
            image_url:"https://maps.googleapis.com/maps/api/staticmap?center=20.006512,73.754632&markers=color:red%7Clabel:C%7C20.00627,73.7533445&zoom=16&size=600x400&key=AIzaSyBJqqGGwS1HthhCLL1HC8F5AcUeMu6eQVs",
            item_url:"https://www.google.co.in/maps/place/The+Chocolate+Room/@20.006512,73.754632,15z/data=!4m5!3m4!1s0x0:0x56b0f519ace92a27!8m2!3d20.006512!4d73.754632"    
          }
          ]
        }
      }
    }
  };   
  callSendAPI(messageData);
}

function sendOpeningHoursText(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },message:{
      text:"Cafe Hours\n11 AM to 10.30 PM"
    }
  };

  callSendAPI(messageData);
}

function sendQuickRepliesActions(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Get Connected...",
      quick_replies: [        
        {
          "content_type":"text",
          "title":"Menu",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_MENU"
        },
        {
          "content_type":"text",
          "title":"Start Over",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_START_OVER"
        }
      ]
    }
  };
  callSendAPI(messageData);
}

function showTestimonials(recipientId){
  var testimonialsText = testimonials + "\n\n" + serviceHighlights + "\n\n" + knowFor;
  var messageData = {
    recipient: {
      id: recipientId
    },message:{
      text:testimonialsText
    }
  };

  callSendAPI(messageData);
}

function showReviews(recipientId){
  console.log("reviews length :" + reviews.length);
  while(reviewCounter < reviews.length){
    var messageData = {
      recipient: {
        id: recipientId
      },message:{
        text:reviews[reviewCounter]
      }
    };
    callSendAPI(messageData);
    console.log("msg" + reviewCounter + " msgis " + reviews[reviewCounter]);
    reviewCounter++;
  }

  reviewCounter = 0;
}

function showTextTemplate(recipientId,msgText){
  var messageData = {
    recipient: {
      id: recipientId
    },message:{
      text:msgText
    }
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

function sendImageMessage(recipientId,imgUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imgUrl
        }
      }
    }
  };

  callSendAPI(messageData);
}

function showMenu(recipientId){
  setTimeout(function(){    
            sendTypingOn(recipientId);
            sendMainMenu(recipientId);
          },delayMills);
}

function getUserData(){
  var userRef = database.ref('/users');
  userRef.once('value',function(snapshot){
    snapshot.forEach(function(childsnapshot){
      var userid = childsnapshot.val().userId;
      var firstName = childsnapshot.val().firstName;
      console.log("user: " + userid + "," + firstName);
      //console.log("user: " + childsnapshot.val());
    });
  });
}

function showPhotos(recipientId){
  var counter = 0;
  var tempIndexArray = [];
  while(counter < 3){
    var num = Math.floor((Math.random() * images.length) + 0);
    tempIndexArray[counter] = num;
    counter++;
  }

   
  Promise.all([sendImageAttachemet(1,tempIndexArray[0],recipientId)])
  .then(function(data){
    console.log(data);
  })
  .catch(function(error){
    console.log('error occurred');
  });

}

function textTemp(recipientId,msgText){
  var messageData = {
    recipient: {
      id: recipientId
    },message:{
      text:msgText
    }
  };
  return callSendAPI(messageData);
}

function sendImageAttachemet(index,imgIndex,recipientId){
  Promise.resolve()
  .then(function(){
    return textTemp(recipientId,'Photos ' + index);
  }).then(function(data){
    var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                type: "image",
                payload: {
                  url: images[imgIndex]
                }
              }
            }
      };
      
      return callSendAPI(messageData);
  });
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
    return 'message sent';
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  //startHourlyBradcast();
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;


