# TomorrowDeveloperPlayground
A Developer Playground (IDE like environment + extras) for tmrow.com

## Running
Please note that the playground is currently in very early development and is only really demo ready.

Due to dependency conflicts in order to run the playground you must follow the following steps:
* Create a new folder and move the entire project into it
* Move the `new-playground` folder out of `tmrowapp-contrib` and into the root of that folder
* Install dependencies with `sudo npm install` in BOTH `new-playground` and `tmrowapp-contrib` (or run console as admin on windows I suppose)
* In `new-playground` run `node esm-start.js` and then `sudo npm start` 
* The frontend will run on 3000 and the server on 3001

## Issues 
If you are encountering issues running please try the following commands
* `sudo npm update`
* `sudo npm update -g create-react-app`
* `sudo npm i -g @csstools/normalize.css`
* `sudo npm i caniuse-lite@1.0.30000974`

