<template>
  <div id="app" class="container" style="height:100%">

    <div style="xxbackground-color:red;">
      <b-navbar class="hero is-link" fixed-top="true">
        <template #brand>
          <b-navbar-item href="#">
            <p class="title is-4">Chrome Extension [{{ extensionName }}]</p>
          </b-navbar-item>
        </template>
      </b-navbar>

      <div style="display:flex; height:90%">

        <b-menu class="box" style="min-width:23ex">
          <b-menu-list label="Menu">
            <b-menu-item icon="account" id="abcde" label="About" v-model="menuActiveAbout"></b-menu-item>
            <b-menu-item icon="account" label="Setup" v-model="menuActiveSetup"></b-menu-item>
            <b-menu-item icon="account" label="Manual" v-model="menuActiveManual"></b-menu-item>
            <b-menu-item icon="account" label="Link" v-model="menuActiveLink"></b-menu-item>
          </b-menu-list>
        </b-menu>

        <div class="fr_main block" style="margin: 3ex; height:100%; width:70vw">

          <!-- About -->
          <div v-if="menuActiveAbout">
            <p class="subtitle">About</p>
            <p>
              Automatically execute pre-defined actions (inserting values, clicking buttons, etc.) when new web page
              loaded.
            </p>
            <ul>
              <li>- The action can be defined per web site (URL pattern).</li>
              <li>- It is a ordered list of firing events (click, focus, etc.) or inserting input values.</li>
              <li>- It is defined as function of URL (including query strings) of web site.</li>
            </ul>
            <br>
            <p>
              For example:<br>
              When opened web site of URL=https://www.google.com?injectWebActions=blahblah,
              this extention automatically inserts "blahblah" (included in the URL) in search box and clicks search
              button.
            </p>
            <br>
            <p>
              Actions are defined and modified by GUI, and stored in the local storage of the web browser.
              These also can be imported by opening the specific URL with query string of action description.
            </p>
          </div>

          <!-- Setup -->
          <div v-if="menuActiveSetup" style="height:100%">

            <div class="level">
              <div class="level-left">
                <p class="subtitle">Setup Rules</p>
              </div>
              <div class="level-right">
                <button class="button is-primary" v-on:click="onclick_load">Load</button>
                <span style="width:1ex"> </span>
                <button class="button is-primary" v-on:click="onclick_save">Save</button>
              </div>
            </div>

            <div v-if="allData" style="min-width:640px; height:100%">
              <div style="display:flex; margin:0px">
                <b-field label="Rules"></b-field>
                <b-button type="is-primary" inverted v-on:click="onclick_add" title="Add Rule">
                  <svg style="width:24px;height:24px;" viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
                  </svg>
                </b-button>
              </div>

              <div style="margin:0px; padding:0px; height:100%;width:100%">

                <!----- Rule BARs ----->
                <div class="panel" animation="slide" style="margin: 5px 0px 5px 40px; height:100%"
                  v-for="(rule, index) of allData.rules" :key="rule.title" :index="index"
                  :manualData="manualData">

                  <div class="my-button" style="display:flex; padding:4px 0 4px 10px; " v-on:click="onclick_bar('select', index)">
                    <div style="margin: 0 auto 0 0">
                      {{ rule?.title }}
                    </div>
                    <b-button type="is-primary" inverted v-on:click="onclick_bar('delete', index);"
                      title="Delete">
                      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor"
                          d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    </b-button>
                  </div>
                </div>

                <!----- POPUP for each Rule -------->
                  <b-modal :active="modalActive" @close="modalActive = false" full-screen scroll="keep"
                    can-cancel="false" style="height:100%">
                    <div class="box" style=" height:1000px;">
                      <!--- head line --->
                      <div style="display:flex">
                        <b-button type="is-primary" inverted v-on:click="modalActive = false" title="Close"
                          style="margin:auto 5px">
                          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                            <path fill="currentColor"
                              d="M13.5 21H6V17H13.5C15.43 17 17 15.43 17 13.5S15.43 10 13.5 10H11V14L4 8L11 2V6H13.5C17.64 6 21 9.36 21 13.5S17.64 21 13.5 21Z" />
                          </svg>
                        </b-button>
                        <p class="title is-4">[Rule] {{ selectedRule.title }}</p>
                      </div>
                      <!--- contents --->
                      <div>
                        <form style="height:100%">
                          <b-field label="Title" horizontal>
                            <input class="input" type="text" v-model="selectedRule.title" :title="manualData[0].description">
                          </b-field>
                          <b-field label="URL Patterns" horizontal>
                            <input class="input" type="text" v-model="selectedRule.url_patterns"
                              :title="manualData[1].description">
                          </b-field>
                          <b-field label="Injection Delay (in msec.)" horizontal>
                            <input class="input" type="number" v-model="selectedRule.delay"
                              :title="manualData[2].description">
                          </b-field>
                          <b-field label="Action Generator" horizontal>
                            <codemirror v-model="selectedRule.action_generator" :options="cmOptions" />
                          </b-field>
                        </form>
                      </div>
                    </div>
                  </b-modal>
                
              </div>
            </div>

            <br><br><br><br>
            <p class="subtitle is-5">Rules Embedded Link</p>
            
            <p>Current rules are embedded in the parameter of the following link address.
            When the link address is opened, the embedded rules are restored and saved in browser.</p>
            <a v-bind:href="embeddedLink" target="_blank">{{embeddedLink}}</a>
            <p>It means, if you bookmark it, you can restore the rules anytime.</p>

          </div>

          <!-- Manual -->
          <div v-if="menuActiveManual" class="is-fullscreen">
            <p class="subtitle">Manual</p>

            <p class="subtitle is-8">Instructions of Setup page</p>
            <b-table :data="manualData" :columns="manualColumns" bordered="true" xxsticky-header="true"></b-table>


            <p class="subtitle is-8">Example of Action Generator</p>
            <pre><code>
              (url) => {
                const param = (new URL(url)).searchParams.get("qname");
                const actions = [
                  { selector: "input", value: param },
                  { selector: "button", event: "click" }
                ];
                return actions;
              }
            </code></pre>

            <br><br>
            <p class="subtitle is-8">Debug</p>

            Select the blue link of "background.html" next to Inspect views
            in the Chrome extension management page,
            to open the Chrome DevTools panel for the background script.
            Most of log messages from this extension appear in the Console tab.<br>
            See <a href="https://developer.chrome.com/docs/extensions/get-started/tutorial/debug?hl=en">here.</a>

          </div>

          <!-- Link -->
          <div v-if="menuActiveLink">
            <p class="subtitle">Links</p>
            <ul>
              <li><a id="store_page" v-bind:href="storeLink" target="_blank">Chrome Web Store Page</a> </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
//import Test from './components/Test.vue'

import { codemirror } from 'vue-codemirror';
//import { basicSetup } from "@codemirror/basic-setup";
//import { oneDark } from "@codemirror/theme-one-dark";
import JSHINT from "jshint";
console.log(JSHINT)
window.JSHINT = JSHINT.JSHINT.
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/javascript-lint.js'

const blankRule = {
  title:null, 
  url_patterns:null,
  delay:null,
  action_generator:null,
}
  
// Promisified version of chrome extension APIs
function chromeRuntimeSendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
}
// Promisified function of Chrome extension APIs
function chromeStorageLocalGet(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}
function chromeStorageLocalSet(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(null);
    });
  });
}

export default {
  name: 'App',
  data: function () {
    return {
      menuActiveAbout: false,
      menuActiveSetup: false,
      menuActiveManual: false,
      menuActiveLink: false,
      allData: null,
      extensionName: chrome.runtime.getManifest().name,
      storeLink: "https://chrome.google.com/webstore/detail/" + chrome.runtime.id,

      manualData: [
                    { 'item': 'Title', 'description': 'Title of the rule'},
                    { 'item': 'URL Pattern', 'description': 'URL prefix to apply this actions'},
                    { 'item': 'Injection Delay Time', 'description': 'Delay (sleep) time before injecting actions'},
                    { 'item': 'Action Generator', 'description': `
                         Definition of a Javascript function that returns a list of web actions (inserting to input box, clicking buttom, etc.). 
                         This function is executed when loaded the web page whose URL matches the URL Pattern.
                         The returned actions are executed inside of the page.<br>
                         - Argument: URL of the web site in the active tab.<br>
                         - Return: A list of action objects each of that have the following keys:<br><br>
                         -- selector: CSS selector string that specifies the target elements. This string is used as argument of document.querySelectors().<br>
                         -- value: value text which is assigned to the value property of the target element. Target element must be input element, textarea element, etc.<br>
                         -- event: Event name which is fired at the target element.<br>
                         -- selector key is mandatory, one and only one of value and event keys is mandatory.
                    `},
      ],                  
      manualColumns: [
        {
          field: 'item',
          label: 'item',
          width: "30ex"
        },
        {
          field: 'description',
          label: 'Description',
        }
      ],
      modalActive: false,
      selectedRule: blankRule,
      cmOptions: { // code mirror options
        mode: "javascript",
        //extensions: [basicSetup],
        //theme: oneDark,
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: { esversion: 6 },
      },
      dummy: JSHINT,
    };
  },
  computed: {
    embeddedLink: function() {
      return "https://www.google.com?injectWebActionsSettings=" + encodeURIComponent(JSON.stringify(this.allData))
    }
  },
  methods: {
    onclick_save: async function () {
      const common = await chromeRuntimeSendMessage("get-common");
      await chromeStorageLocalSet({ [common.storageKey]: this.allData });
    },
    onclick_load: async function () {
      const common = await chromeRuntimeSendMessage("get-common");
      const storageData = await chromeStorageLocalGet(common.storageKey);
      let settings = storageData[common.storageKey];
      if (!(settings)) {
        settings = common.defaultSettings;
      }
      console.log("settings", settings);
      this.allData = settings;
    },
    onclick_add: function () {
      this.allData.rules.push({
        title: "New Title",
        url_patterns: "",
        delay: 500,
        action_generator: `
// Definition of action generator function
//   - url: url in the active tab
//   - actions: a list of
//       { selector: <CSS selector of target element>, value: <insert value> }
//           or
//       { selector: <CSS selector of target element>, event: <event name to be fired> }
(url) => {
    // user logic here ...
    const actions = [{}];
    return actions;
}`
      });
    },
    onclick_bar: function(type, index) {
        if(type === "delete") {
          this.selectedRule = blankRule; 
          this.allData.rules.splice(index, 1);
        } else { // select
          this.modalActive = true; 
          this.selectedRule = this.allData.rules[index];
        }
    }
  },
  components: {
    codemirror,
  },
};
</script>


<style>
.my-button {
  background-color: white;
}

.my-button:hover {
  background-color: whitesmoke;
}

.CodeMirror {
  height: auto;
}

#appxx {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
