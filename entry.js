var onfModule = require('./ourNetFunctions.js')
var onf = onfModule()

var checkDb = document.getElementById('checkDb')
checkDb.addEventListener('click',onf.checkDb)