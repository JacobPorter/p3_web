define("p3/widget/viewer/GenomeGroup", [
	"dojo/_base/declare","dijit/layout/BorderContainer","dojo/on",
	"dojo/dom-class","dijit/layout/ContentPane","dojo/dom-construct",
	"../PageGrid","../formatter","./GenomeList"
], function(
	declare, BorderContainer, on,
	domClass,ContentPane,domConstruct,
	Grid,formatter,GenomeList
){
	return declare([BorderContainer], {
		"baseClass": "GenomeGroup",
		"disabled":false,
		"query": null,
		containerType: "genome_group",
		_setQueryAttr: function(query){
			this.query = query;
			if (this.viewer){
				this.viewer.set("query", query);
			}
		},
		startup: function(){
			if (this._started) {return;}
			this.viewHeader = new ContentPane({content: "Genome Group Viewer", region: "top"});
			this.viewer =  new GenomeList({
				region: "center",
				query: (this.query||""),
				apiToken: window.App.authorizationToken,
				apiServer: window.App.dataAPI,
				query: this.query
			});
/*
				var _self = this
                                this.viewer.on("ItemDblClick", function(evt) {
                                    console.log("dblclick row:", row)
					evt.preventDefault();
					evt.stopPropagation();

					on.emit(_self.domNode, "ItemDblClick", 
                                                item_path: evt.item_path,
                                                item: evt.item,
                                                bubbles: true,
						containerType: this.containerType,
                                                cancelable: true
                                        });
                               });

                                this.viewer.on("select", function(evt) {
                                        console.log('dgrid-select: ', evt);
					evt.preventDefault();
					evt.stopPropagation();
                                        var newEvt = {
                                                rows: event.rows,
                                                selected: evt.selected
                                                grid: evt.grid
                                                bubbles: true,
						containerType: this.containerType,
                                                cancelable: true
                                        }
                                        on.emit(_self.domNode, "select", newEvt);
                               });
                               this.viewer.on("deselect", function(evt) {
                                        console.log("deselect");
					evt.preventDefault();
					evt.stopPropagation();
                                        var newEvt = {
                                                rows: event.rows,
                                                selected: evt.selected
                                                grid: evt.grid,
                                                bubbles: true,
						containerType: this.containerType,
                                                cancelable: true
                                        }
                                        on.emit(_self.domNode, "deselect", newEvt);
                                        return;
                                });
*/
			this.addChild(this.viewHeader);
			this.addChild(this.viewer);
			this.inherited(arguments);
//			this.viewer.refresh();
		}
	});
});
