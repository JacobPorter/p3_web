define("p3/widget/Phylogeny", [
	"dojo/_base/declare",
	"dijit/_WidgetBase", "dojo/request","dojo/dom-construct", "dojo/_base/lang",
	"dojo/dom-geometry", "dojo/dom-style", "d3/d3"
], function(declare, WidgetBase, request,domConstruct,lang,domGeometry,domStyle,d3){


	return declare([WidgetBase],{
		type: "rectangular",
		state: null,
		taxon_id: null,
		newick: null,
		apiServer: window.App.dataAPI,

		postCreate: function(){
			this.containerNode = this.canvasNode = domConstruct.create("div",{id: this.id +"_canvas"}, this.domNode);
			this.watch("state", lang.hitch(this, "onSetState"));
			this.watch("taxon_id", lang.hitch(this,"onSetTaxonId"))
			this.watch("newick", lang.hitch(this,"renderTree"))
		},

		onSetState: function(attr,oldVal,state){
			console.log("Phylogeny onSetState: ", state);
			if (!state) { return; }

			if (state.genome){
				this.set("taxon_id", state.genome.taxon_id);
			}else if (state.taxonomy){
				this.set("taxon_id", state.taxonomy.taxon_id);
			}
		},

		onSetTaxonId: function(attr,oldVal,taxonId){
			console.log("taxonId: ", taxonId);

			request.get(this.apiServer + "/taxonomy/" + taxonId,{
				headers: {accept: "application/newick"}
			}).then(lang.hitch(this,function(newick){
				console.log("Set Newick");
				this.set('newick', newick);
			}));
		},

		renderTree: function(){
			if (!this.newick){
				console.log("No Newick File To Render")
				return;
			}
			console.log("D3: ", d3);
		},

		onFirstView: function(){
			this.renderTree();
		},
		resize: function(changeSize, resultSize){
            var node = this.domNode;

            // set margin box size, unless it wasn't specified, in which case use current size
            if(changeSize){

                    domGeometry.setMarginBox(node, changeSize);
            }

            // If either height or width wasn't specified by the user, then query node for it.
            // But note that setting the margin box and then immediately querying dimensions may return
            // inaccurate results, so try not to depend on it.

            var mb = resultSize || {};
            lang.mixin(mb, changeSize || {});       // changeSize overrides resultSize
            if( !("h" in mb) || !("w" in mb) ){

                    mb = lang.mixin(domGeometry.getMarginBox(node), mb);    // just use domGeometry.marginBox() to fill in missing values
            }


            // Compute and save the size of my border box and content box
            // (w/out calling domGeometry.getContentBox() since that may fail if size was recently set)
            var cs = domStyle.getComputedStyle(node);
            var me = domGeometry.getMarginExtents(node, cs);
            var be = domGeometry.getBorderExtents(node, cs);
            var bb = (this._borderBox = {
                    w: mb.w - (me.w + be.w),
                    h: mb.h - (me.h + be.h)
            });
            var pe = domGeometry.getPadExtents(node, cs);
            this._contentBox = {
                    l: domStyle.toPixelValue(node, cs.paddingLeft),
                    t: domStyle.toPixelValue(node, cs.paddingTop),
                    w: bb.w - pe.w,
                    h: bb.h - pe.h
            };

			if (this.debounceTimer){
				clearTimeout(this.debounceTimer);
			}
			this.debounceTimer = setTimeout(lang.hitch(this, function(){
				this.renderTree();
			}),250);
	      
		}

	});
});