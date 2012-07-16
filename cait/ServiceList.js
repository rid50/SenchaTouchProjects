Ext.define("cait.view.ServiceList", {
    extend: 'Ext.navigation.View',
	xtype: 'servicelist',

	requires: [
		'Ext.dataview.List',
		'Ext.data.TreeStore',
		'Ext.data.ArrayStore',
		'Ext.data.Store',
		'Ext.data.proxy.JsonP',
		'Ext.data.reader.Xml',
		'Ext.field.Search'
	],
	
	//constructor: function (config) {
    //    this.callParent(arguments);
		//debugger;
    //},
	
	//var servicelist = Ext.ComponentQuery.query('servicelist')[0];
	
	getTitleTextTpl: function() {
        return '{description}';
    },
	
	getItemTextTpl: function() {
        return '{description}';
    },
		
	config: {
		title: 'Citizens & Residents',
		iconCls: 'bookmarks',
		scrollable: false,
		padding: 0,
		
		navigationBar: {
			//xtype : 'titlebar',   // by default
			id: 'navigationBar',
			docked: 'top',
        },
        //updateTitleText: false,
        //useTitleAsBackText: false,
		
		items: [{
			xtype: 'list',
			title: 'Citizens & Residents',
			margin: 0,
						
			//itemTpl: '{description} {imgURL}',
			itemTpl: '<div dir="rtl"><strong style="{color}">{description}</strong>' + 
					 '<img style="vertical-align: bottom" src="resources/images/{imgURL}" /></div>',
			//itemTpl: '<div class="contact">{title} <strong>{author}</strong></div>',

			//loadingText : "Loading...",
			emptyText: '<div class="service-list-empty">No services found.</div>',

			listeners: {
				activate: function(container, newActiveItem, oldActiveItem, eOpts ) {
					var searchfield = Ext.ComponentQuery.query('searchfield')[0];
					if (searchfield != undefined)
						searchfield.show();
				},
				
				itemtap: function(list, index, target, record, e, eOpts) {
					if (index != 1 && index != 4) {
						Ext.Msg.setWidth(250);
						Ext.Msg.alert(record.get('description'), 'Not implemented yet', Ext.emptyFn); 
						return;
					}

					var tl = Ext.ComponentQuery.query('servicelist')[0];
					
					if (index == 1) {
						tl.push({
							xtype: 'panel',
							//id: 'submitForm',
							scrollable: true,
							scroll: 'both',
							items: [
								{
									html: '<iframe frameborder=\"0\" scrolling=\"no\" style=\"width:310px;\" src =\"http://www.zakathouse.org.kw/AxCMSwebLive_KGO/publish/ar_calculators.aspx\"></iframe>',							
								},
							],
						});
					} else if (index == 4){
						tl.push({
							xtype: 'panel',
							//id: 'submitForm',
							margin: '-15 0 0 0',
							items: [
								{
									html: '<iframe frameborder=\"0\" scrolling=\"no\" style=\"width:320px;\" src =\"http://www.paci.gov.kw/kgo/en-renew.html?Theme=1234567\"></iframe>',							
								},
							],
						});
					}
					
					var searchfield = Ext.ComponentQuery.query('searchfield')[0];
					if (searchfield != undefined)
						searchfield.hide();
				}
			},
				
			store: {
				id: 'mystore',
				autoLoad: true,
				
				remoteFilter: true,

				data: [
                    {color:'color:gray', description: 'احسب زكاتك ',  imgURL:'eservice_icon.gif'},
                    {color:'color:black', description: 'إيصالات دفع الرسوم وأوامر تقدير الرسوم القضائية ',  imgURL:'eservice_icon.gif'},
                    {color:'color:gray', description: 'خدمات ذوي الإحتياجات الخاصة ',  imgURL:'spacer.gif'},
                    {color:'color:gray', description: 'الوقف عن طريق الإنترنت-الوقف الإلكتروني ',  imgURL:'eservice_icon.gif'},
                    {color:'color:black', description: 'Civil ID Renewal ',  imgURL:'eservice_icon.gif'},
                ],
				fields: ['color', 'description', 'imgURL'],
			}
		}]
	},
	
    onRemoteSearchKeyUp: function(list, field) {
	
        //get the store and the value of the field
        var value = field.getValue(),
            store = Ext.getStore('mystore');

        //first clear any current filters on the store
        store.clearFilter();

		store.filter('ref_no', value);
		store.load();
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
                        didMatch = record.get('description').match(search);

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
			{name: 'description', type: 'string'},
			{name: 'imgURL', type: 'string'},
		],
		idProperty: 'description'
	}
});
