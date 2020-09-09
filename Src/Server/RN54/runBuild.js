//nodejs打包
//命令行执行 node package projectname ios , node package projectname android 打包相应平台 
var fs = require('fs');
var exec = require('child_process').exec;
const { LogUtil } = require('../Util');
function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};
var system = process.argv[3];
var projectName = process.argv[2];
if(!projectName){
	console.log('need projectName param');
}else{
	if(system === 'ios' || system === 'android'){
		//先删除旧的升级包
		deleteFolderRecursive("./projects/" + projectName + "/build/bundle-" + system);
		//创建新的升级包目录
		fs.mkdirSync("./projects/" + projectName + "/build/bundle-" + system);
		//执行打包命令
		console.log("packaging......");
		
		var build = exec('react-native bundle --entry-file ./projects/' + projectName + 
			'/viomiIndex.js --bundle-output ./projects/' + projectName + '/build/bundle-' + system + '/viomiIndex.bundle --platform ' 
			+ system + ' --assets-dest ./projects/' + projectName + '/build/bundle-' + system + ' --dev false',
			function(error, stdout, stderr) {
				if(error){
					LogUtil.bundleLog.error(error);
					console.log("================package error================",error);
					return;
				}
				if(stderr){
					LogUtil.bundleLog.error(stderr);
					console.log("================package error================",stderr);
					return;
				}
				console.log("================package result================",stdout);
				//更新versionCode
				var obj = JSON.parse(fs.readFileSync('./projects/' + projectName + '/package-' + system + '.json'));
				obj.versionCode++;
				var str = JSON.stringify(obj);
				fs.writeFileSync('./projects/'+ projectName +'/package-' + system + '.json', str);
				fs.writeFileSync('./projects/'+ projectName +'/build/bundle-' + system + '/package.json',str);
				//完成
				console.log('package done');
			});
		build.stdout.on('data', function(data) {
			console.log(data);
		});
	}else{
		console.log('need system param');
	}
}
