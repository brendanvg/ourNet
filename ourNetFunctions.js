var hyperquest = require('hyperquest')
var catS = require('concat-stream')

module.exports =

function initialize(){
	return {
		checkDb: checkDb,
	}	

function checkDb (){
	var stream = hyperquest('http://localhost:3000/checkDb')
	.pipe(
		catS(function(data){
			var x = data.toString()
			var y = JSON.parse(x)
			console.log(y)
		})
	)
}


}