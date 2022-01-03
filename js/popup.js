Array.prototype.contains=function (ele) {
    for (var i=0;i<this.length;i++){
        if (this[i]==ele){
            return true;
        }
	}
	return false;
}
Array.prototype.del=function(ele){
	for(var i=0;i<this.length;i++){
		if(this[i]==ele){
			this.splice(i,1);
			return true;
		}
	}
}
var config,MODE,configMode;
var otp={
	init:function(){
		otp.initOpt();
		document.addEventListener("click",this,false);
		document.addEventListener("change",this,false);
		otp.initI18n();
	},
	getConfOBJ:function(e){
		var ele=e.target||e;
		var getdata=function(ele){
			if(ele.dataset.confobj){
				return ele.dataset.confobj;
			}else{
				return arguments.callee(ele.parentNode);
			}
		}
		var confArray=getdata(ele).split("|");
		var confOBJ=config;
		for(var i=0;i<confArray.length;i++){
			confOBJ=confOBJ[confArray[i]];
		}
		return confOBJ;
	},
	initOpt:function(){
		if(config.mode=="new"){
			document.querySelector(".mode_title").innerText=otp.getI18n("title_otn");
			document.querySelector("#ul_new").style.cssText+="display:block;";
			document.querySelector("#ul_current").remove();
		}else{
			document.querySelector(".mode_title").innerText=otp.getI18n("title_otc");
			document.querySelector("#ul_current").style.cssText+="display:block;";
			document.querySelector("#ul_new").remove();
		}

		//init radio
		var radios=document.querySelectorAll("input[type=radio][name=mode]");
		for(var i=0;i<radios.length;i++){
			if(radios[i].value==config.mode){
				radios[i].checked=true;
			}
		}		

		//init checkbox
		var doms=document.querySelectorAll(".init");
		for(var i=0;i<doms.length;i++){
			doms[i].checked=configMode.settings[doms[i].dataset.confele]
		}

		//init action menu
		var dom_domain=document.querySelector(".action_domain");
		var dom_page=document.querySelector(".action_page");
		chrome.tabs.query({active:true},function(tabs){
			chrome.tabs.sendMessage(tabs[0].id,{type:"rule_action"},function(response){
				if(!response){
					var _doms=document.querySelectorAll(".check_hide");
					for(var i=0;i<_doms.length;i++){
						_doms[i].style.cssText+="display:none;";
					}
					return;
				}
				// dom_domain.style.cssText+="display:block;";
				// dom_page.style.cssText+="display:block;";

				if(configMode.rule_domain.contains(response.domain)){
					dom_domain.innerText=otp.getI18n("deldomain");
					dom_domain.dataset.action="deldomain";
				}else{
					dom_domain.innerText=otp.getI18n("adddomain");
					dom_domain.dataset.action="adddomain";
				}
				if(configMode.rule_page.contains(response.page)){
					dom_page.innerText=otp.getI18n("delpage");
					dom_page.dataset.action="delpage";
				}else{
					dom_page.innerText=otp.getI18n("addpage");
					dom_page.dataset.action="addpage";
				}
				return;
			})
		})
	},
	handleEvent:function(e){
		switch(e.type){
			case"click":
				if(e.target.classList.contains("add")){
					chrome.tabs.query({active:true},function(tabs){
						chrome.tabs.sendMessage(tabs[0].id,{type:"rule_action",value:e.target.dataset.action},function(response){
							console.log(response);
							otp.ruleAction(e.target.dataset.action,response)
							return;
						})
					})
				}
				if(e.target.classList.contains("mode_btn")){
					var radios=document.querySelectorAll("input[type=radio][name=mode]");
					for(var i=0;i<radios.length;i++){
						if(radios[i].checked){
							config.mode=radios[i].value;
							otp.saveConf();
							window.setTimeout(function(){location.reload()},100)
						}
					}
				}
				if(e.target.classList.contains("mode_switch")){
					document.querySelector(".action").style.cssText+="display:none;";
					document.querySelector("#mode").style.cssText+="display:block;";
					document.querySelector(".mode_switch").style.cssText="opacity:0;";
					document.querySelector(".mode_title").innerText=otp.getI18n("title_switch");
				}
				if(e.target.classList.contains("open_opt")){
					chrome.tabs.create({url:"../html/options.html"});
				}
				if(e.target.classList.contains("open_rate")){
					chrome.tabs.create({url:"https://chrome.google.com/webstore/detail/"+chrome.runtime.id})
				}
				break;
			case"change":
				if(e.target.classList.contains("change")){
					configMode.settings[e.target.dataset.confele]=e.target.checked;
					otp.saveConf();
					window.close();
				}
				break;
		}
	},
	ruleAction:function(type,value){
		switch(type){
			case"adddomain":
				var _domain=value.domain;
				if(!configMode.rule_domain.contains(_domain)){
					configMode.rule_domain.push(_domain)
				}
				break;
			case"addpage":
				var _page=value.page;
				if(!configMode.rule_page.contains(_page)){
					configMode.rule_page.push(_page)
				}
				break;
			case"deldomain":
				console.log(value)
				var _domain=value.domain;
				configMode.rule_domain.del(_domain);
				break;
			case"delpage":
				var _page=value.page;
				configMode.rule_page.del(_page);
				break;
		}
		otp.saveConf();

		chrome.runtime.sendMessage({type:"config_afteraction",value:config},function(){})

		//insert new config to page
		// chrome.tabs.query({active:true},function(tabs){
		// 	chrome.tabs.sendMessage(tabs[0].id,{type:"config_afteraction",value:config},function(response){
		// 	})
		// })
	},
	saveConf:function(){
		chrome.runtime.sendMessage({type:"saveconfig",value:config},function(){})
		return;
		chrome.storage.sync.clear(function(){
			console.log(config)
			chrome.storage.sync.set(config);
			chrome.runtime.sendMessage({type:"loadconfig"},function(){})
		})
	},
	getI18n:function(str){
		var trans=chrome.i18n.getMessage(str);
		return trans||str;
	},
	initI18n:function(){
		var doms=document.querySelectorAll("[data-i18n]");
		for(var i=0;i<doms.length;i++){
			doms[i].innerText=otp.getI18n(doms[i].dataset.i18n);
		}
	}
}
// chrome.storage.sync.get(function(item){
// 	config=item;
// 	MODE=config.mode;
// 	configMode=config["mode_"+config.mode];

// 	otp.init();
// })
chrome.runtime.sendMessage({type:"evt_getconf"},function(response){
	if(response){
		config=response;
		configMode=config["mode_"+config.mode];
		otp.init();
	}
})