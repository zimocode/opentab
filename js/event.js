Array.prototype.contains=function (ele) {
    for (var i=0;i<this.length;i++){
        if (this[i]==ele){
            return true;
        }
	}
	return false;
}
var config,configMode;
var ote={
	init:function(){
		console.log(config)
		document.addEventListener("click",this,false);
	},
	handleEvent:function(e){
		switch(e.type){
			case"click":
				console.log(e)
				if(!configMode.settings.enable){return;}
				if(e.target.nodeName=="A"&&e.target.href&&e.target.href.indexOf("javascript")!=0&&!e.target.hash&&e.target.href.substr(e.target.href.length-1,1)!="#"){
					console.log("click")
					var _domain=document.domain,
					      _url=document.location.href;
					if(configMode.settings.all){
						chrome.runtime.sendMessage({type:"open",url:e.target.href},function(response){})
						e.preventDefault();
					}else{
						if(configMode.rule_domain.contains(_domain)||configMode.rule_page.contains(_url)){
							chrome.runtime.sendMessage({type:"open",url:e.target.href},function(response){})
							e.preventDefault();						
						}
					}
				}
				break;
		}
	}
}
chrome.runtime.sendMessage({type:"evt_getconf"},function(response){
	if(response){
		config=response;
		configMode=config["mode_"+config.mode];
		ote.init();
	}
})
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse) {
	console.log(message)
	if(message.type=="rule_action"){
		sendResponse({page:document.location.href,domain:document.domain})
	}
	if(message.type=="config_afteraction"){
		config=message.value;
		configMode=config["mode_"+config.mode];
	}
})
