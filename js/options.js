var config;
var oto={
	init:function(){
		document.addEventListener("click",this,false);
		document.addEventListener("change",this,false);
		oto.initRule();
		oto.showTab(document.querySelectorAll(".tab")[0],document.querySelectorAll(".nav_tab")[0]);
		oto.initI18n();
		oto.initOpt();
		oto.initEnd();
	},
	handleEvent:function(e){
		switch(e.type){
			case"click":
				if(e.target.classList.contains("nav_tab")){
					var thetab=document.querySelector(".tab[data-tab="+e.target.dataset.navtab+"]");
					oto.showTab(thetab,e.target);
				}
				if(e.target.tagName.toLowerCase()=="button"){
					var _array=oto.getConfArray(e);
					var _value=e.target.parentNode.querySelector("textarea").value;
					_value=_value.split("\n");
					console.log(_value)
					config[_array[0]][_array[1]]=oto.fixArray(_value);
					oto.saveConf();
				}
				break;
			case"change":
				oto.optChange(e);
				break;
		}
	},
	showTab:function(tab,navtab){
		var tabs=document.querySelectorAll(".tab");
		for(var i=0;i<tabs.length;i++){
			tabs[i].style.cssText+="opacity:0;z-index:-1;";
		}
		tab.style.cssText+="opacity:1;z-index:1;";
		if(!navtab){return}
		var navs=document.querySelectorAll(".nav_tab");
		for(var i=0;i<navs.length;i++){
			navs[i].className="nav_tab";
		}
		navtab.classList.add("nav_current");
	},
	initRule:function(){
		_domtxt=document.querySelector(".rule_domain textarea");
		var rules_domain=config.mode_new.rule_domain;
		var rules_newdomain="",
			rules_newpage="",
			rules_currentdomain="",
			rules_currentpage="";
		var dom_newdomain=document.querySelector("textarea.rule_value.rule_newdomain"),
			dom_newpage=document.querySelector("textarea.rule_value.rule_newpage"),
			dom_currentdomain=document.querySelector("textarea.rule_value.rule_currentdomain"),
			dom_currentpage=document.querySelector("textarea.rule_value.rule_currentpage");
		for(var i=0;i<config.mode_new.rule_domain.length;i++){
			rules_newdomain=rules_newdomain+(rules_newdomain?"\n":"")+config.mode_new.rule_domain[i];
		}
		for(var i=0;i<config.mode_new.rule_page.length;i++){
			rules_newpage=rules_newpage+(rules_newpage?"\n":"")+config.mode_new.rule_page[i];
		}
		for(var i=0;i<config.mode_current.rule_domain.length;i++){
			rules_currentdomain=rules_currentdomain+(rules_currentdomain?"\n":"")+config.mode_current.rule_domain[i];
		}
		for(var i=0;i<config.mode_current.rule_page.length;i++){
			rules_currentpage=rules_currentpage+(rules_currentpage?"\n":"")+config.mode_current.rule_page[i];
		}
		dom_newdomain.value=rules_newdomain;
		dom_newpage.value=rules_newpage;
		dom_currentdomain.value=rules_currentdomain;
		dom_currentpage.value=rules_currentpage;
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
	getConfArray:function(e){
		var ele=e.target||e;
		var getdata=function(ele){
			if(ele.dataset.confobj){
				return ele.dataset.confobj;
			}else{
				return arguments.callee(ele.parentNode);
			}
		}
		var confArray=getdata(ele).split("|");
		return confArray;
	},
	fixArray:function(array){
		var _array=array;
		for(var i=0;i<array.length;i++){
			if(array[i]==""){
				array.splice(i,1);
				i--;
			}
		}
		return array;
	},
	saveConf:function(){
		chrome.storage.sync.clear(function(){
			console.log(config)
			chrome.storage.sync.set(config);
			oto.showMsg(oto.getI18n("msg_saved"),"save",null,null);
			chrome.runtime.sendMessage({type:"loadconfig"},function(){})
		})
	},
	getI18n:function(str){
		var trans=chrome.i18n.getMessage(str);
		return trans||str;
	},
	initI18n:function(){
		var i18ns=document.querySelectorAll("[data-i18n]");
		for(var i=0;i<i18ns.length;i++){
			i18ns[i].innerText=oto.getI18n(i18ns[i].dataset.i18n);
		}
	},
	initOpt:function(){
		var doms=document.querySelectorAll(".init");
		for(var i=0;i<doms.length;i++){
			if(doms[i].tagName.toLowerCase()=="input"&&doms[i].type=="checkbox"){
				doms[i].checked=oto.getConfOBJ(doms[i])[doms[i].dataset.confele];
			}
		}
	},
	optChange:function(e){
		if(e.target.tagName.toLowerCase()=="input"&&e.target.type=="checkbox"){
			oto.getConfOBJ(e)[e.target.dataset.confele]=e.target.checked;
		}
		oto.saveConf();
	},
	showMsg:function(){

	},
	showMsg:function(str,type,mytime,index){
		var str=str?str:suo.getI18n("msg_saved");
		var type=type?type:"save";
		var mytime=(mytime&&mytime>0)?mytime:2;
		var index=index?index:100;
		var obj=oto.posMsgBox(); //document.querySelector("msgbox");
		switch(type){
			case"save":
				obj.style.cssText+="background-color:#259b24;";
				break;
			case"error":
				obj.style.cssText+="background-color:red;";
				break;
			case"warning":
				OBJ.style.cssText+="background-color:yellow;color:rgba(0,0,0,.8);";
				break;
		}
		obj.innerText=str;
		window.setTimeout(function(){
			obj.style.cssText+="transition:all .4s ease-in-out;top:70px;opacity:1;z-index:"+index;
		},100);
		window.setTimeout(function(){
			obj.style.cssText+="transition:all .5s ease-in-out;top:0px;opacity:0;z-index:1";
		},mytime*1000)
	},
	posMsgBox:function(){
		var obj=document.querySelector("msgbox");
		obj.style.left=(window.innerWidth-parseInt(window.getComputedStyle(obj).width.substr(0,window.getComputedStyle(obj).width.length-2)))/2+"px";
		return obj;
	},
	initEnd:function(){
		document.querySelector("#vernum").innerText=chrome.runtime.getManifest().version;
	}
}
chrome.storage.sync.get(function(items){
	console.log("s")
	config=items;
	oto.init();
})