# inject web actions
Chrome Extension that calls native node.js script from browser.

* [Chrome Store page](https://chrome.google.com/webstore/detail/native-script-caller/ckgdggmpioeabapnhoglbmeibhbdmmoe)

### How to publish to Chrome Web Store

* In Chrome Web Store Developp]er dashboard, upload ./ChromeStore.zip file to Chrome Web Store
* The files in ./publish foler are used to fill in dashboard forms.

### Used versions

```
$ node -v     
v22.12.0                                
$ npm list    
vue@0.1.0 /home/sdkn104/inject-web-actio
ns/vue                                  
├── @vue/cli-plugin-babel@4.5.19        
├── @vue/cli-plugin-eslint@4.5.19       
├── @vue/cli-service@4.5.19             
├── babel-eslint@10.1.0                 
├── bindings@1.5.0 extraneous           
├── buefy@0.9.29                        
├── core-js@3.11.1                      
├── eslint-plugin-vue@6.2.2             
├── eslint@6.8.0                        
├── file-uri-to-path@1.0.0 extraneous   
├── jshint@2.13.6                       
├── jszip@3.10.1                        
├── nan@2.22.0 extraneous               
├── vue-codemirror@4.0.6                
├── vue-template-compiler@2.7.16        
└── vue@2.7.16           
```

### Creation of Development Environment (Vue)

```
- install node and npm
> //npm install -g vue  (vue2)  // not required, vue cli includes vue???
> npm install -g @vue/cli  
> vue create vue   // specifying vue2 default
> cd vue
> npm install buefy
> npm install vue-codemirror
- add to package.json
  "eslintConfig": {
    "env": {
      "webextensions": true
    },
  }
- add to vue.config.js
    module.exports = {
        publicPath: './'
    }

```

OR

```
cd vue
npm install  // install all for ./packatge.json
```

### Build and Deploy

```
> cd vue
> // npm run lint
> // npm run serve
> npm run build  // compile ./public and ./src  into ./dist
> DEPLOY.bat     // copy ./dist to ../ChromeStore/vue/dist, and zip ChromeStore
```
