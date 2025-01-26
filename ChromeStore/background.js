// Copyright (C) 2025 hashedtomato3@gmail.com
// License: MIT 

// common parameters
const common = {};
common.appName = "com.node.inject_web_actions"
common.storageKey = common.appName + ".storage_key"
common.defaultSettings = {
    rules: [
        {
            title: "Yahoo Search",
            url_patterns: "https://www.yahoo.com",
            action_generator: "(url) => { return {selector: ''} }"
        }
    ]
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
function chromeTabsSendMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, {}, (response) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(response);
        });
    });
}

// on insalled
chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// on message from options page menu
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if( message == "get-common" ) { // on click of setup botton in option page
        sendResponse(common);
    } else {
        throw "error"
    }
    return true; // this is nessesary for response to caller page
});

// on page-updated in a tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        console.debug("tab updated.....", tabId, tab.url, tab);
        if (changeInfo.status === 'complete') {
            console.debug("tab loaded: ", tab)
            // If URL includes settings, read and store them in localStorage
            const injectWebActionsSettings = (new URL(tab?.url))?.searchParams.get('injectWebActionsSettings'); //
            if( injectWebActionsSettings ) {
                const settings = JSON.parse(injectWebActionsSettings);
                await chromeStorageLocalSet({ [common.storageKey]: settings });
                console.info("[inject-web-actions] Stored settings from URL: ", settings);
            }

            // load settings from local storage
            const storageData = await chromeStorageLocalGet(common.storageKey);
            let settings = storageData[common.storageKey];
            console.debug("Loaded settings: ", settings)
            if(!settings) {
                settings = common.defaultSettings;
            }

            // for settings.rules, execute actions
            for( const rule of settings?.rules ) {
                console.debug("for rule: ", rule, tab.url)
                if( rule.url_patterns && !rule.url_patterns.startsWith("chrome-extension") && tab.url?.startsWith(rule.url_patterns) ) {
                    // execute action_generator in sandbox, and get actions
                    const resp = await executeSandboxScript({script:rule.action_generator, info:tab.url});
                    const actions = resp.response;
                    console.log("[inject-web-actions] actions: ", actions, rule.title, tab.url)
                    // inject actions to active Tab
                    const r = await executeActionsOnTabPage(tabId, changeInfo, tab, actions, rule.delay);
                    console.log("[inject-web-actions] done actions: ", r, rule.title)
                }
            }
        }
});


// on clicking menu item
async function executeActionsOnTabPage(tabId, changeInfo, tab, actions, delay) {
    console.debug("---- executeActionsOnTabPage --------", tabId, tab)
    // injection code definition
    async function injectionCode(actions){
        console.debug("start injectionCode: ",actions)
        // do each action
        for(const a of actions ) {
            const elems = document.querySelectorAll(a.selector);
            console.debug("doing action: ", a, elems)
            console.log("va", ("value" in a));
            console.log("ev", ("event" in a));
            if("value" in a) {
                elems.forEach((elem) => { elem.value = a.value;})
            } else if("event" in a ) {
                console.log("event: ", a.event)
                if( a.eventConstructor === "InputEvent" ) {
                    e = new InputEvent(a.event, a.eventOptions);
                } else if( a.eventConstructor === "KeyboardEvent" ) {
                    e = new KeyboardEvent(a.event, a.eventOptions);
                } else if( a.eventConstructor === "MouseEvent" ) {
                    e = new MouseEvent(a.event, a.eventOptions);
                } else if( a.eventConstructor === "WheelEvent" ) {
                    e = new WheelEvent(a.event, a.eventOptions);
                } else if( a.eventConstructor === "CompositionEvent" ) {
                    e = new CompositionEvent(a.event, a.eventOptions);
                } else {
                    e = new Event(a.event);
                }
                console.log("event: ", e)
                elems.forEach((elem) => { 
                    console.log("firing: ", a.event)
                    const r = elem.dispatchEvent(e); 
                    console.log("fired: ", r)
            
                })
            } else if("delay" in a ) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        console.debug("end injectionCode")
        return true;
    }
    // activate target tab
    await chrome.tabs.update(tabId, { active: true });

    // delay time for waiting page construction finish 
    await new Promise(resolve => setTimeout(resolve, delay));

    // inject injection code
    const r = await chrome.scripting.executeScript({
        target: {tabId: tabId, allFrames:false},
        func:injectionCode,
        args: [actions]
    });
    console.debug("result of injectionCode: ", r)
    return r;
}


async function executeSandboxScript(msg){ // msg = { script:<script>, info:<info> }
        //console.info("creating tab for sandbox page")
        // create tab of sandbox page
        const url = chrome.runtime.getURL("sandbox_page.html")
        const tab = await chrome.tabs.create({url: url});
        //console.log(tab)
        // wait for load page
        for(let i=0; i<30; i++){
            await new Promise(resolve => setTimeout(resolve, 200));
            let [t] = await chrome.tabs.query({ active: true, currentWindow: true });
            //console.log(t.status)
            if( t.status === "complete" ) {
                //console.log("break waiting at: "+i)
                break;
            }
        }
        // send starter message to sandbox_page
        console.debug("Start Sandbox Script:")
        console.debug(msg);
        const sandboxPageResults = await chromeTabsSendMessage(tab.id, msg);
        console.debug("End Sandbox Script:");
        console.debug(sandboxPageResults?.response);
        // check error in injection code
        if(sandboxPageResults.error){
            throw sandboxPageResults; // return error
        }
        return sandboxPageResults; // { response:<returnValue> }
 }
