define("p3/widget/DownloadTooltipDialog", [
	"dojo/_base/declare", "dojo/on", "dojo/dom-construct",
	"dojo/_base/lang", "dojo/mouse","rql/js-array",
	"dojo/topic", "dojo/query", "dijit/layout/ContentPane",
	"dijit/Dialog", "dijit/popup", "dijit/TooltipDialog",
	"./AdvancedDownload", "dojo/dom-class","FileSaver","dojo/when"
], function(declare, on, domConstruct,
			lang, Mouse,rql,
			Topic, query, ContentPane,
			Dialog, popup, TooltipDialog,
			AdvancedDownload, domClass, saveAs, when){

	return declare([TooltipDialog], {
		containerType: "",
		selection: null,
		grid: null,

		_setSelectionAttr: function(val){
			// console.log("DownloadTooltipDialog set selection: ", val);
			this.selection = val;
		},
		timeout: function(val){
			var _self = this;
			this._timer = setTimeout(function(){
				popup.close(_self);
			}, val || 2500);
		},

		onMouseEnter: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}

			this.inherited(arguments);
		},
		onMouseLeave: function(){
			popup.close(this);
		},

		downloadSelection: function(type,selection){
		
			var conf = this.downloadableConfig[this.containerType];
			var sel = selection.map(function(sel){
				return sel[conf.field || conf.pk]
			});

			console.log("DOWNLOAD TYPE: ", type)
			if (conf.generateDownloadFromStore && this.grid && this.grid.store && type && this["_to" + type]){
				var query = "in(" + (conf.field || conf.pk) + ",(" + sel.join(",") + "))&sort(+" + conf.pk + ")&limit(2500000)"
				when(this.grid.store.query({}), lang.hitch(this,function(results){
					results = rql.query(query,{},results);
					var data = this["_to" + type.toLowerCase()](results);
					saveAs(new Blob([data]), this.containerType + "_selection." + type);
				}));
			}else{

				var accept;
				switch(type){
					case "csv":
					case "tsv":
						accept = "text/" + type;
						break;
					case "excel":
						accept = "application/vnd.openxmlformats";
						break;
					default:
						accept = "application/" + type;
						break;
				}
				
				var baseUrl = (window.App.dataServiceURL ? (window.App.dataServiceURL) : "")
				
				if(baseUrl.charAt(-1) !== "/"){
					baseUrl = baseUrl + "/";
				}
				baseUrl = baseUrl + conf.dataType + "/";
				var query = "in(" + (conf.field || conf.pk) + ",(" + sel.join(",") + "))&sort(+" + conf.pk + ")&limit(2500000)"
				console.log("Download Query: ", query);

				var form = domConstruct.create("form", {
					style: "display: none;",
					id: "downloadForm",
					enctype: 'application/x-www-form-urlencoded',
					name: "downloadForm",
					method: "post",
					action: baseUrl + "?&http_download=true&http_accept=" + accept
				}, this.domNode);
				domConstruct.create('input', {type: "hidden", value: encodeURIComponent(query), name: "rql"}, form);
				form.submit();
			 }
		},

		_tocsv: function(selection){
			var out = [];
			var keys = Object.keys(selection[0]);

			var header=[]
			keys.forEach(function(key){
				header.push(key);
			});
			out.push(header.join(","));
			selection.forEach(function(obj){
				var io = [];

				keys.forEach(function(key){
					io.push('"' + obj[key] + '"');
				})

				out.push(io.join(","));
			});

			return out.join("\n");

		},


		_totsv: function(selection){
			var out = [];
			var keys = Object.keys(selection[0]);

			var header=[]
			keys.forEach(function(key){
				header.push(key);
			});
			out.push(header.join("\t"));
			selection.forEach(function(obj){
				var io = [];

				keys.forEach(function(key){
					io.push('"' + obj[key] + '"');
				})

				out.push(io.join("\t"));
			});

			return out.join("\n");

		},

		startup: function(){
			if(this._started){
				return;
			}
			on(this.domNode, Mouse.enter, lang.hitch(this, "onMouseEnter"));
			on(this.domNode, Mouse.leave, lang.hitch(this, "onMouseLeave"));
			var _self = this;
			on(this.domNode, ".wsActionTooltip:click", function(evt){
				// console.log("evt.target: ", evt.target, evt.target.attributes);
				var rel = evt.target.attributes.rel.value;
				if(rel == "advancedDownload"){

					// console.log("Selection: ", _self.selection);
					var d = new Dialog({title: "Download"});
					var ad = new AdvancedDownload({selection: _self.selection, containerType: _self.containerType});
					domConstruct.place(ad.domNode, d.containerNode);
					d.show();
					return;
				}
				var conf = _self.downloadableConfig[_self.containerType];

				// var sel = _self.selection.map(function(sel){
				// 	return sel[conf.field || conf.pk]
				// });

				_self.downloadSelection(rel,_self.selection)
			});

			var dstContent = domConstruct.create("div", {});
			this.labelNode = domConstruct.create("div", {style: "background:#09456f;color:#fff;margin:0px;margin-bottom:4px;padding:4px;text-align:center;"}, dstContent);
			this.selectedCount = domConstruct.create("div", {}, dstContent);
			var table = domConstruct.create("table", {}, dstContent);

			var tr = domConstruct.create("tr", {}, table);
			var tData = this.tableDownloadsNode = domConstruct.create("td", {style: "vertical-align:top;"}, tr);
			//spacer
			domConstruct.create("td", {style: "width:10px;"}, tr);
			var oData = this.otherDownloadNode = domConstruct.create("td", {style: "vertical-align:top;"}, tr);

			domConstruct.create("div", {"class": "wsActionTooltip", rel: "tsv", innerHTML: "Text"}, tData);
			domConstruct.create("div", {"class": "wsActionTooltip", rel: "csv", innerHTML: "CSV"}, tData);
			// domConstruct.create("div", {"class": "wsActionTooltip", rel: "excel", innerHTML: "Excel"}, tData);

			tr = domConstruct.create("tr", {}, table);
			var td = domConstruct.create("td", {"colspan": 3, "style": "text-align:right"}, tr);
			this.advancedDownloadButton = domConstruct.create("span", {
				"class": "wsActionTooltip",
				style: "padding:4px;",
				rel: "advancedDownload",
				innerHTML: "Advanced"
			}, td);

			this.set("content", dstContent);

			this._started = true;
			this.set("label", this.label);
			this.set("selection", this.selection);

		},

		_setLabelAttr: function(val){
			this.label = val;
			if(this._started){
				this.labelNode.innerHTML = "Download selected " + val + " (" + (this.selection ? this.selection.length : "0") + ") as...";
			}
		},

		downloadableDataTypes: {
			"dna+fasta": "DNA FASTA",
			"protein+fasta": "Protein FASTA"
		},

		"downloadableConfig": {
			"genome_data": {
				"label": "Genomes",
				"dataType": "genome",
				pk: "genome_id",
				tableData: true,
				advanced: true
			},
			"sequence_data": {
				"label": "Sequences",
				"dataType": "sequence",
				pk: "sequence_id",
				tableData: true,
				otherData: ["dna+fasta", "protein+fasta"]
			},
			"feature_data": {
				"label": "Features",
				"dataType": "genome_feature",
				pk: "feature_id",
				tableData: true,
				otherData: ["dna+fasta", "protein+fasta"]
			},
			"spgene_data": {
				dataType: "sp_gene",
				field: "feature_id",
				pk: "id",
				"label": "Specialty Genes",
				tableData: true
			},
			"pathway_data": {
				pk: "pathway_id",
				dataType: "pathway",
				"label": "Pathways",
				"generateDownloadFromStore": true,
				tableData: true
			},
			"gene_expression_data": {
				dataType: "transcriptomics_gene",
				pk: "pid",
				"label": "Gene Expression",
				tableData: true
			},
			"default": {
				"label": "Items",
				tableData: true
			}
		},

		_setContainerTypeAttr: function(val){
			// console.log("setContainerType: ", val);
			var label;
			this.containerType = val;

			var conf = this.downloadableConfig[val] || this.downloadableConfig["default"];

			this.set("label", conf.label);

			if(!this._started){
				return;
			}

			domConstruct.empty(this.otherDownloadNode);

			if(conf.otherData){
				conf.otherData.forEach(function(type){
					domConstruct.create("div", {
						"class": "wsActionTooltip",
						rel: type,
						innerHTML: this.downloadableDataTypes[type]
					}, this.otherDownloadNode);
				}, this);
			}

			if(conf.advanced){
				domClass.remove(this.advancedDownloadButton, "dijitHidden");
			}else{
				domClass.add(this.advancedDownloadButton, "dijitHidden");
			}

		}
	});

});
