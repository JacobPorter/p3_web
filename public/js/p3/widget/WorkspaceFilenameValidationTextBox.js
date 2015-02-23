define([
	"dojo/_base/declare","dijit/_WidgetBase","dojo/on","dojo/_base/lang",
	"dojo/dom-class", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
	"./FlippableDialog","dijit/_HasDropDown","dijit/layout/ContentPane","dijit/form/TextBox",
	"./WorkspaceExplorerView","dojo/dom-construct","../WorkspaceManager","dojo/store/Memory",
	"./Uploader", "dijit/layout/BorderContainer","dojo/dom-attr",
	"dijit/form/Button","dojo/_base/Deferred","dijit/form/CheckBox","dijit/form/ValidationTextBox"

], function(
	declare, WidgetBase, on,lang,
	domClass,Templated,WidgetsInTemplate,
	Dialog,HasDropDown,ContentPane,TextBox,
	Grid,domConstr,WorkspaceManager,Memory,
	Uploader, BorderContainer,domAttr,
	Button,Deferred,CheckBox,ValidationTextBox
){


	return declare([ValidationTextBox], {
/*		"baseClass": "WorkspaceObjectSelector",*/
		"disabled":false,
		workspace: "",
		value: "",
		path: "",
		disabled: false,
		required: false,
		showUnspecified: false,
		promptMessage:"",
		missingMessage: "A valid workspace item is required.",
		promptMessage: "Please choose or upload a workspace item",
		nameIsValid: false,

		_setPathAttr: function(val){
			console.log("_setPathAttr: ", val);
			this.path=val;

			if (this.value) {
				this.checkForName(val);
			}
		},	
	
		postMixinProperties: function(){
			if (!this.value && this.workspace){
				this.value=this.workspace;
			}
			this.inherited(arguments);
		},

		checkForName: function(val){
			if (!this.path) { return; }
			this.externalCheck="checking";
			this.externalCheckValue = val;
			return Deferred.when(WorkspaceManager.getObject(this.path+"/"+val),lang.hitch(this,function(obj){
				if (obj) {
					console.log("Found Existing Object",obj);
					this.externalCheck="exists";
					this.set('invalidMessage',"A file with this name already exists in " + this.path);
					this.validate();
				}else{
					this.externalCheck="empty";
				}
//				this.displayMessage();
			}), lang.hitch(this, function(err){
				console.log("FileNot Found...good");
				this.externalCheck="empty";
			}));
		},

		validator: function(val,constraints){
			var valid = false;				
			var re=/(\(|\)|\/|\:)/g
			var match = val.match(re);

			if ( this.required && this._isEmpty(val) ) { return false; }

			if (!this.path) {
				this.set('invalidMessage', "The output folder has not been selected");
				return false;
			}

			if (val.match(re)){
				this.set('invalidMessage',"This name contains invalid characters: '" + match[0]+"'")
				return false;
			}
			console.log("ExternalCheck: ", this.externalCheck);
			console.log("Val: ", val, "ExternalCheckVal: ", this.externalCheckValue)
			if (this.externalCheckValue && val==this.externalCheckValue){
				if (this.externalCheck=="exists") { return false; }
				return true;
			}else if (val) {
				this.checkForName(val);
			}

			return true;
		}
	});
});