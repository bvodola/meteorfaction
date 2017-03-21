#!/usr/bin/env node

// =======
// Imports
// =======
var util = require('util')
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var program = require('commander');
var config = require(path.join(process.cwd(),'wf_deploy.json'));

// ==========================
// Writing the new start file
// ==========================

// This part of the script writes a file that is just like the one generated
// by WebFaction to manage the node process. The only change is on the
// startup file path, changed from the default hello-world.js to budle/main.js,
// suited for the meteor app standard

fs.writeFile(
	process.cwd()+'/start',
	"#!/bin/sh\n"+
	"mkdir -p /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/run\n"+
	"pid=$(/sbin/pidof /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/bin/node)\n"+
	"if echo \"$pid\" | grep -q \" \"; then\n"+
	"  pid=\"\"\n"+
	"fi\n"+
	"if [ -n \"$pid\" ]; then\n"+
	"  user=$(ps -p $pid -o user:20 | tail -n 1)\n"+
	"  if [ $user = \""+config.wf_username+"\" ]; then\n"+
	"    exit 0\n"+
	"  fi\n"+
	"fi\n"+
	"nohup /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/bin/node /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/bundle/main.js > /dev/null 2>&1 &\n"+
	"/sbin/pidof /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/bin/node > /home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/run/node.pid\n",
	function(err) {
    if(err) {
        return console.log(err);
    }
});

// ==================
// Localhost Commands
// ==================

// First, let's build our Local Meteor APP, using the meteor build command
// More info at http://docs.meteor.com/#/full/meteorbuild
console.log("Deploy started:");
console.log("Building Meteor App...");

// var args = {};
// var isValueOfLastindex = false;
//
// // print process.argv
// process.argv.forEach(function (val, index, array) {
// 	console.log(index,val);
// 	if(!isValueOfLastindex && index>1) {
//   	if(val.substr(0,2) === '--' && index <= array.length-1) {
// 			args[val.substr(2)] = array[index+1];
// 			isValueOfLastindex = true;
// 		}
// 	} else {
// 		isValueOfLastindex = false;
// 	}
// });

exec("meteor build build --architecture os.linux.x86_64 --server "+config.wf_root_url+":"+config.wf_port, (e,se,so) => {

	if(!e) {

		console.log("Build ok. Transfering files to remote server...");
		// 	If there are no errors, proceed to transfering the tar.gz file generated to the WebFaction server
		exec("scp "+process.cwd()+"/build/"+config.local_app_name+".tar.gz "+config.wf_username+"@"+config.wf_server+":/home/"+config.wf_username+"/webapps/"+config.wf_app_name+"/build.tar.gz && rm -rf "+process.cwd()+"/build/"+config.local_app_name+".tar.gz" , (e, se, so) => {
			console.log(so);

			if(!e) {

				// ============
				// SSH Commands
				// ============

				// cd to the App folder, then deletes and previous build.tar.gz,
				// changes the current bundle to the old_bundle folder and extracts
				// the files from the build.tar.gz file that was transfered.
				console.log("Transfering ok. Extracting files...");
				exec("ssh "+config.wf_username+"@"+config.wf_server+" \"cd ~/webapps/"+config.wf_app_name+" && rm -rf bundle && tar -zxf build.tar.gz && rm build.tar.gz\"", (e,se,so) => {

					if(!e) {

						// Runs npm install for the built node app and removes the start file from the bin folder
						console.log("Files extracted. Installing app dependencies...");
						exec("ssh "+config.wf_username+"@"+config.wf_server+" \"cd ~/webapps/"+config.wf_app_name+"/bundle/programs/server && npm install && cd ../../../bin && rm start\"", (e,se,so) => {

							if(!e) {

								// Transfer the custom start file to the remote server using scp
								console.log("Dependencies installed. Configuring server...");
								exec("scp "+process.cwd()+"/start "+config.wf_username+"@"+config.wf_server+":/home/bvodola/webapps/"+config.wf_app_name+"/bin/start", (e,se,so) => {

									if(!e) {

										// Defines enviroment variables needed for the Meteor APP to work correctly (ROOT_URL, MONGO_URL and PORT)
										// and then restarts server using the ./stop and ./start commands from the bin folder
										console.log("Server configured. Defining environent variables and restarting server...");
										exec("ssh "+config.wf_username+"@"+config.wf_server+" \"cd ~/webapps/"+config.wf_app_name+" && export MONGO_URL="+config.mongo_url+" && export ROOT_URL="+config.wf_root_url+" && export PORT="+config.wf_port+" && export MAIL_URL="+config.mail_url+" && cd bin && ./stop && chmod u+x start && ./start \"", (e,se,so) => {
											if(!e) {

												console.log("Deploy process ended.");


											} else {
												console.log(e);
											}
										});

									} else {
										console.log(e);
									}

								});

							} else {
								console.log(e);
							}

						});

					} else {
						console.log(e);
					}

				});

			} else {
				console.log(e);
			}

		});

	} else {
		console.log(e);
	}
});
