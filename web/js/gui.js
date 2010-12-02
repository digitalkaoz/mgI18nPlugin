Ext.ns('Ext.ux.sfI18n');

/**
 * handles the debug toolbar button click
 */
Ext.ux.sfI18n.handleTrigger = function(trigger){
  
  var win = window.translation_win;

  Ext.get(trigger).on('click', function(trigger){
    // create the window on the first click and reuse on subsequent clicks
    if(!win){
      win = new Ext.ux.sfI18n.Window({animateTarget:this});
    }        
    win.setVisible(!win.isVisible());
  });  
}
  
/**
 * the translations window
 */  
Ext.ux.sfI18n.Window = Ext.extend(Ext.Window, {
  
  /**
   * window constructor
   */
  constructor: function(config) {
    if(config == undefined){
      config = {};
    }
    
    Ext.ux.sfI18n.Window.superclass.constructor.call(this, Ext.apply(config, {
      id:'translation-window',
      layout:'fit',
      width:700,
      height:450,
      title: Ext.ux.sfI18n.translations.title,
      //modal: true,
      border: false,
      closeAction:'hide',
      plain: true,
      items: [
      this.createTabPanel()
      ]
    }));
  },
  
  /**
   * create the tabpanel for storing "site","files","database"
   */
  createTabPanel: function(){
    return {
      xtype: 'tabpanel',      
      resizeTabs: true,
      tabMargin: 10,
      activeTab:0,
      deferredRender:false,
      frame: false,
      border: false,
      plain: true,
      defaults: {
        frame: false,
        border: false,
        plain: true
      },
      items:[
      { 
        xtype: 'panel',
        iconCls: 'ext-ux-sfi18n-site',
        title: Ext.ux.sfI18n.translations.current,
        layout: 'border',
        items:[
        this.createGrid(Ext.ux.sfI18n.urls.current,'current-grid','current-store',window._mg_i18n_messages),
        this.createFormPanel(Ext.ux.sfI18n.transunits,'current-translation-form')
        ]
      },
      { 
        xtype: 'panel',
        iconCls: 'ext-ux-sfi18n-files',
        title: Ext.ux.sfI18n.translations.files,
        layout: 'border',
        items:[
        this.createGrid(Ext.ux.sfI18n.urls.file,'file-grid','file-store')
        ],
        listeners: {
          show: function(panel){
            panel.findByType('grid')[0].getStore().load();
          }
        }
      },
      { 
        xtype: 'panel',
        iconCls: 'ext-ux-sfi18n-database',
        title: Ext.ux.sfI18n.translations.database,
        layout: 'fit',
        items:[
        this.createGrid(Ext.ux.sfI18n.urls.database,'database-grid','database-store')
        ],
        listeners: {
          show: function(panel){
            panel.findByType('grid')[0].getStore().load();
          }
        }
      }
      ]
    };
  },
  
  /**
   * creates the form panel to update translations
   */
  createFormPanel : function(transunits, id){
    var fields = new Array();

    fields.push({
      xtype: 'hidden',
      id: 'catalog',
      name: 'catalogue'
    });

    fields.push({
      xtype: 'hidden',
      id: 'source',
      name: 'source'
    });

    Ext.each(transunits,function(unit){
      this.push({
        xtype: 'textarea',
        id: unit.code,
        width: '90%',
        labelStyle: 'font-weight:bold;',
        grow: true,      
        fieldLabel : unit.name,
        name       : 'targets['+unit.code+']'
      });
    },fields);

    return {
      xtype: 'form',
      split: true,
      border: false,
      frame: false,
      id: id,
      region     : 'east',
      autoScroll: true,
      layout     : 'form',    
      bodyStyle  : {
        padding: '2% 5%',
        background:'none'
      },
      labelAlign : 'top',
      labelWidth : 100,
      width      : 250,
      items: fields,
      buttons: [
      //the save button
      {
        text: Ext.ux.sfI18n.translations.save,
        handler:function(b){
          b.findParentByType('form').getForm().submit({
            url: Ext.ux.sfI18n.urls.update,
            waitMsg: Ext.ux.sfI18n.translations.save,
            submitEmptyText: false,
            success: function(form,action){
            //TODO update grid row
            },
            failure : function(form,action){
              trans_form_mask.hide();
              Ext.Msg.show({
                title:'Error',
                msg: Ext.util.Format.stripTags(action.response.responseText),
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
              });
            }
          });
        }
      },
      //the delete button
      {
        text: Ext.ux.sfI18n.translations.deleteit,
        id:'trans-delete', 
        handler:function(b){
          // Show a dialog using config options:
          Ext.Msg.show({
            title: Ext.ux.sfI18n.translations.deleteit,
            msg: 'You are about to delete a Translation!',
            buttons: Ext.Msg.YESNOCANCEL,
            animEl: b,
            icon: Ext.MessageBox.QUESTION,
            fn: function(btn){
              if(btn == 'yes'){
                b.findParentByType('form').getForm().submit({
                  url: Ext.ux.sfI18n.urls.update,
                  method: 'POST',
                  params: {
                    'delete' : true
                  },
                  waitMsg: Ext.ux.sfI18n.translations.deleteit,
                  submitEmptyText: false,
                  success: function(form,action){
                    form.loadRecord(new Ext.data.Record());
                    Ext.StoreMgr.get('current-store').remove(form.record);
                    form.record = null;
                  },
                  failure : function(form,action){
                    trans_form_mask.hide();
                    Ext.Msg.show({
                      title:'Error',
                      msg: Ext.util.Format.stripTags(action.response.responseText),
                      buttons: Ext.MessageBox.OK,
                      icon: Ext.MessageBox.ERROR
                    });
                  }
                });                 
            }
          }
          });
  }
}]
};
},  
    
/**
 *  creates the grids for the different views
 */
createGrid: function(url, id, storeId,data){
  return {
    xtype: 'grid',
    region:'center',
    id: id,
    loadMask: true,
    plain:true,
    frame:false,
    //autoWidth:true,
    autoExpandColumn : 'target',
    stripeRows: true, // stripe alternate rows
    view: new Ext.grid.GroupingView({
      forceFit:true,
      groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
    }),
    columns:[{
      header: "",
      dataIndex: 'is_translated',
      width:16,
      sortable: true,
      menuDisabled: true,
      groupable: false,
      hideable: false,
      renderer : function(val){
        return val ? '' : '<span class="ext-ux-sf18n-ok"></span>';
      }
    },{
      id: 'catalog',
      header: "catalog",
      dataIndex: 'catalog',
      hidden: true
    },{
      id: 'source',
      groupable: false,
      sortable: false,
      hideable: false,
      renderer: function(val){
        return Ext.util.Format.htmlEncode(val);
      },
      header: Ext.ux.sfI18n.translations.source,
      dataIndex: 'source'
    },{
      id:'target',
      groupable: false,
      sortable: false,
      hideable: false,
      renderer: function(val){
        return Ext.util.Format.htmlEncode(val);
      },
      header: Ext.ux.sfI18n.translations.target,
      dataIndex: 'target'
    },{
      id:'params',
      groupable: false,
      sortable: false,
      header: "params",
      dataIndex: 'params',
      hidden:true
    }],
    tbar: [
    {
      text: Ext.ux.sfI18n.translations.translated,
      scope: this,
      enableToggle: true,
      handler : function(el){
        store = Ext.StoreMgr.get(storeId);
        if(el.pressed){
          store.filter([
          {
            property : 'is_translated', 
            value: false
          },

          {
            property : 'source', 
            value: /[\D]/
          },
          ]);              
        }else{
          store.filter([
          {
            property : 'id', 
            value: /\w/
          },

          {
            property : 'source', 
            value: /\D/
          },
          ]);              
        }              
      }
    },{xtype:'tbtext', text:'Filter:'},{
      xtype: 'textfield',
      enableKeyEvents: true,
      fieldLabel: 'Filter',
      listeners:{
        keyup :function(field,e){
          var store = field.findParentByType('grid').getStore();
          
          if(!field.getRawValue().length){
            store.filter([
            {
              property : 'id', 
              value: /\w/
            },
            {
              property : 'source', 
              value: /\D/
            },
            ]);            
          }else{
            var regex = new RegExp(field.getRawValue(),'i');
            
            store.filterBy(function(record,id){
              if(!record.data.source.match(regex) && !record.data.target.match(regex)){
                return false;
              }
              return true;
            });            
          }
        }
      }      
    }
    ],
    bbar: {
      xtype:'paging',
      pageSize: 50,
      //            store: store,
      displayInfo: true,
      displayMsg: 'Displaying {0} - {1} of {2}',
      listeners: {
        render: function(paging){
          var store = paging.findParentByType('grid').getStore();
          store.filter([
          {
            property : 'id', 
            value: /\w/
          },
          {
            property : 'source', 
            value: /\D/
          },
          ]);
          if(store.proxy){
            paging.findParentByType('grid').getTopToolbar().hide();
            paging.bindStore(store,true);
          }else{
            paging.hide();
          }
        }
      }
    },
      
    listeners:{
      rowclick: function(grid,index){
        var record = grid.getStore().getAt(index);
        //ajax request to fetch all translations from the database
        trans_form_mask = new Ext.LoadMask(Ext.ComponentMgr.get('current-translation-form').body);
        trans_form_mask.show();
        Ext.Ajax.request({
          url: url,
          method: 'GET',
          autoAbort: true,
          params: {
            catalogue: record.data.catalog,
            source: record.data.source
          },
          scope: this,
          record: record,
          success : function(response, opts) {
            var data = Ext.decode(response.responseText);            
            var form = Ext.ComponentMgr.get('current-translation-form');
            Ext.ux.sfI18n.formHook();
            trans_form_mask.hide();
            //load records from store
            form.getForm().loadRecord(opts.record);
            form.getForm().record = opts.record;
            //set translation fields from the response
            for(var i=0;i<data.length;i++){
              if(form.findById(data[i].code)){
                form.findById(data[i].code).setValue(data[i].value);
              }
            }
              
            if(opts.record.data.is_translated){
              form.buttons[1].enable();
            }else{
              form.buttons[1].disable();
            }
          },
          failure : function(response,opts){
            trans_form_mask.hide();
            Ext.Msg.show({
              title:'Error',
              msg: Ext.util.Format.stripTags(response.responseText),
              buttons: Ext.MessageBox.OK,
              icon: Ext.MessageBox.ERROR
            });
          }
        });
      }
    },
    store: this.createStore(storeId,url,data)
  };  
},
    
    /**
     * creates the store which holds the translations
     */
createStore: function(id, url, data){
  var config = {
    groupField:'catalog',
    id: id,
    reader : new Ext.data.JsonReader({
      root: 'messages',
      idProperty: 'id',
      fields: ['catalog','id','is_translated','params','source','target']                          
    })      
  };

  if(data){
    config.data = data;
    config.autoLoad = true;
  }else{
    config.proxy = new Ext.data.HttpProxy({
      api: {
        read    : {
          url: url, 
          method:'GET'
        },
        create  : {
          url: url, 
          method:'POST'
        },
        update  : {
          url: url, 
          method:'POST'
        },
        destroy : {
          url: url, 
          method:'POST'
        }
      }    
    });
    config.baseParams = {
      start : 0,
      limit : 50
    };
  }

  return new Ext.data.GroupingStore(config);
}

});


//bind the ext stuff to the debug toolbar trigger
Ext.onReady(function(){
  Ext.ux.sfI18n.handleTrigger('translation-trigger');
});
