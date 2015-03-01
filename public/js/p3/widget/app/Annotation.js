define([
	"dojo/_base/declare","dijit/_WidgetBase","dojo/on",
	"dojo/dom-class","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/Annotation.html","./AppBase","p3/widget/WorkspaceFilenameValidationTextBox",
	"p3/widget/TaxonNameSelector"
], function(
	declare, WidgetBase, on,
	domClass,Templated,WidgetsInTemplate,
	Template,AppBase,TaxonNameSelector
){
	return declare([AppBase], {
		"baseClass": "Annotation",
		templateString: Template,
		applicationName: "GenomeAnnotation",
		required: true,

		constructor: function(){
			this._selfSet=true;
		},	

		onOutputPathChange: function(val){
			this.output_nameWidget.set("path", val);
		},
	
		onTaxIDChange: function(val){
		},
		onSuggestNameChange: function(val){
			if (val && !this.output_nameWidget.get('value') || (this.output_nameWidget.get('value')&&this._selfSet)  ){
				this._selfSet=true;
				/*var abbrv=this.scientific_nameWidget.get('displayedValue');
				abbrv=abbrv.match(/[^\s]+$/);
				this.output_nameWidget.set('value',abbrv);*/
			}
		}

	});
});

