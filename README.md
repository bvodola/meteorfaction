# meteorfaction

Command-line tool for deploying [Meteor](http://www.meteor.com) APPs to [Webfaction](www.webfaction.com]

## Basic Configuration

*Obs: This packages assumes you use [SSH Keys](https://docs.webfaction.com/user-guide/access.html#using-ssh-keys)*

If you haven't, create a new Node 0.10.43 App using [WebFaction Panel](https://my.webfaction.com/new-application) and take note of the App's PORT Number

In the command line, run `npm install -g meteorfaction` or `sudo npm install -g meteorfaction` if you need root access

Then, in your Meteor App root directory, create a wf_deploy.json file with the following structure and fill the gaps:

```json
{
	"local_app_name": "",
	"wf_app_name": "",
	"wf_server": "",
	"wf_username": "",
	"mongo_url": "",
	"wf_port": "",
	"wf_root_url": ""
}
```
Some explanations about the parameters above:

`local_app_name` The name of your app folder in your local machine

`wf_app_name` The name of the Node application in your WebFaction panel

`wf_server` The address of your WebFaction server. Example: web123.webfaction.com

`wf_username` Your WebFaction main username.

`mongo_url` Example: mongodb://user:password@ds123456.mlab.com:11122/something

`wf_port` The PORT of your WebFaction APP. Example: 16788

`wf_root_url` The URL of your application's site. Example: http://www.something.com

## Deploying

After you completed the steps above, run `meteorfaction` inside your App's Root Folder and wait for the deploy to complete. That's it!
