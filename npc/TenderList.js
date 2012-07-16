var tenderList = Ext.define("npc.view.TenderList", {
    extend: 'Ext.navigation.View',
	//extend: 'Ext.dataview.NestedList',
	//extend: 'Ext.dataview.List',
	xtype: 'tenderlist',

	requires: [
		'Ext.dataview.List',
		'Ext.data.TreeStore',
		'Ext.data.ArrayStore',
		'Ext.data.Store',
		'Ext.data.proxy.JsonP',
		'Ext.data.reader.Xml',
		'Ext.field.Search'
	],
	
	//var tenderlist = Ext.ComponentQuery.query('tenderlist')[0];
	
	getTitleTextTpl: function() {
        return '{ref_no} -- {description}';
    },
	
	getItemTextTpl: function() {
        return '(ref.no: {ref_no}) {description}';
    },
	
	config: {
		title: 'Tender list',
		iconCls: 'bookmarks',
		//displayField: 'description',
		//itemTpl: '{description}',
		fullscreen: true,
		styleHtmlContent: true,
		scrollable: true,
	
		navigationBar: {
			//xtype : 'titlebar',   by default
			id: 'navigationBar',
			docked: 'top',
			//layout: {
				//type: 'hbox',
				//align: 'start'
				//pack: 'start'
			//},
		
			items: [
				//{ xtype: 'spacer' },
				{
					//itemId: 'se',
					xtype: 'searchfield',
					placeHolder: 'Search...',
					width: '50%',
					
					listeners: {
						//scope: this,
						//keyup: function(field) {
						action: function(field) {
						//console.log('keyup');
							var tenderlist = Ext.ComponentQuery.query('tenderlist')[0];
							//tenderlist.onSearchKeyUp(field);
							tenderlist.onRemoteSearchKeyUp(tenderlist, field);
						},
						clearicontap: function() {
						//console.log('clear');
							var tenderlist = Ext.ComponentQuery.query('tenderlist')[0];
							tenderlist.onSearchClearIconTap();
						}
					}
				}
				//{ xtype: 'spacer' }
			]
			
			//ui: 'dark'
            //id:'itemToolbar'
        },
        //updateTitleText: false,
        //useTitleAsBackText: false,
		
		items: [{
			xtype: 'list',
			title: 'Tender list',
			
			itemTpl: '<div>Ref.No: <strong>{ref_no}</strong> {description}</div>',

			//loadingText : "Loading...",
			emptyText: '<div class="tender-list-empty">No tenders found.</div>',

			//masked: {
			//	xtype: 'loadmask',
			//	message: 'Loading...'
			//},
			listeners: {
				//afterrender : function(cmp){
                //   cmp.refresh();
                //},

				activate: function(container, newActiveItem, oldActiveItem, eOpts ) {
				//back: function(nestedList, node, lastActiveList, detailCardActive, eOpts) {
					//var sf = Ext.ComponentQuery.query('searchfield')[0];
					//sf.show();

					//var toolbar = Ext.ComponentQuery.query('toolbar', this)[0];
					//this.child('titlebar').setTitle('Tender list');
					//console.log(container.xtype);
					var searchfield = Ext.ComponentQuery.query('searchfield')[0];
					if (searchfield != undefined)
						searchfield.show();
					//toolbar.child('searchfield').hide();
					//toolbar.show();
				},
				
				itemtap: function(list, index, target, record, e, eOpts) {

					var tl = Ext.ComponentQuery.query('tenderlist')[0];
					
					var pan = tl.push({				// if extend: 'Ext.navigation.View',
						xtype: 'panel',
						//title: 'recordget',
						title: '<div>Ref.No: <strong>' + record.get('ref_no') + '</div>',

						html: 
						'<strong>Country: </strong>' + record.get('country') + '<br/>' + 
						'<strong>Category: </strong>' + record.get('category') + '<br/>' +	
						'<strong>Notice type: </strong>' +record.get('notice_type') + '<br/>' +	
						'<strong>Description: </strong>' + record.get('description') + '<br/>' + 
						'<strong>Action deadline: </strong>' + Ext.util.Format.date(record.get('action_deadline'), 'd/m/Y'),
						
						scrollable: true,
						styleHtmlContent: true
					});
					

					searchfield.hide();
				}
			},
				
			store: {
				id: 'mystore',
				autoLoad: true,
				//autoSync: true,
				//remoteSort: true,
				
				remoteFilter: true,
				
				fields: [
					'ref_no', 'country', 'category', 'notice_type', 'description', 'action_deadline', 'details'
				],
/*
				fields: [
					'ref_no', 'country', 'category', 'notice_type', 'description', 'action_deadline', 'details',
					{name: 'leaf', defaultValue: true}
				],
				
				root: {leaf: false},
*/
				proxy: {
					type: 'ajax',
					url: './syndication.php',
					
					reader: {
						type: 'xml',
						record: 'entry',
						rootProperty: 'feed'
					}
				}
			}
		}]
	},
	
    onRemoteSearchKeyUp: function(list, field) {
	
        //get the store and the value of the field
        var value = field.getValue(),
            store = Ext.getStore('mystore');

		//console.log(value);
			
        //first clear any current filters on the store
        store.clearFilter();

		store.filter('ref_no', value);

		//store.sync();
		store.load();
		//list.setStore(store);

		return;
	},
	
    /**
     * Called when the search field has a keyup event.
     *
     * This will filter the store based on the fields content.
     */
    onSearchKeyUp: function(field) {
	
        //get the store and the value of the field
        var value = field.getValue(),
            store = Ext.getStore('mystore');

        //first clear any current filters on the store
        store.clearFilter();

        //check if a value is set first, as if it isn't we dont have to do anything
        if (value) {
            //the user could have entered spaces, so we must split them so we can loop through them all
            var searches = value.split(' '),
                regexps = [],
                i;
			//console.log('searches.length: ' + searches.length);

            //loop them all
            for (i = 0; i < searches.length; i++) {
			//console.log(searches[i]);
				
                //if it is nothing, continue
                if (!searches[i]) continue;

                //if found, create a new regular expression which is case insenstive
                regexps.push(new RegExp(searches[i], 'i'));
            }

            //now filter the store by passing a method
            //the passed method will be called for each record in the store
            store.filter(function(record) {
                var matched = [];

                //loop through each of the regular expressions
                for (i = 0; i < regexps.length; i++) {
                    var search = regexps[i],
                        didMatch = record.get('ref_no').match(search) || record.get('description').match(search);

					//console.log('didMatch: ' + didMatch);
						
                    //if it matched the first or last name, push it into the matches array
                    matched.push(didMatch);
                }

                //if nothing was found, return false (don't show in the store)
                if (regexps.length > 1 && matched.indexOf(false) != -1) {
					//console.log('not found: ' + record.getId());
                    return false;
                } else {
					//console.log('found: ' + matched[0] + ' ' + record.getId());
                    //else true true (show in the store)
                    return matched[0];
                }
            });
        }
    },

    /**
     * Called when the user taps on the clear icon in the search field.
     * It simply removes the filter form the store
     */
    //onSearchClearIconTap: function(field, e, eOpts) {
    onSearchClearIconTap: function() {
        //call the clearFilter method on the store instance
        Ext.getStore('mystore').clearFilter();
        Ext.getStore('mystore').load();
    }
});


Ext.define('MyModel', {
	extend: 'Ext.data.Model',
    config: {
		fields: [
			{name: 'ref_no', type: 'string'},
			{name: 'country', type: 'string'},
			{name: 'category', type: 'string'},
			{name: 'notice_type', type: 'string'},
			{name: 'description', type: 'string'},
			{name: 'action_deadline', type: 'date'},
			{name: 'details', type: 'string'},
		],
		idProperty: 'ref_no'
	}
});
