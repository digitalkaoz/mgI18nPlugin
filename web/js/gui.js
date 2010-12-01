Ext.ns('Ext.ux.sfI18n');

Ext.ux.sfI18n.handleTrigger = function(trigger){
  var win = window.translation_win;

  Ext.get(trigger).on('click', function(){
      // create the window on the first click and reuse on subsequent clicks
      if(!win){
          win = new Ext.ux.sfI18n.Window();
      }        
      if(win.isVisible()){
        win.hide();
      }else{
        win.show();
      }
  });  
}
  
Ext.ux.sfI18n.Window = Ext.extend(Ext.Window, {
  
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
        modal: true,
        border: false,
        closeAction:'hide',
        plain: true,
        items: [
          this.createTabPanel()
        ]
    }));
  },
  
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
        {text: Ext.ux.sfI18n.translations.save,handler:function(b){
            b.findParentByType('form').getForm().submit({
              url: Ext.ux.sfI18n.urls.update,
              waitMsg: Ext.ux.sfI18n.translations.save,
              submitEmptyText: false
            });
        }}
      ]
    };
  },  
    
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
          renderer : function(val){ return val ? '' : '<span class="ext-ux-sf18n-ok"></span>';}
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
          renderer: function(val){return Ext.util.Format.htmlEncode(val);},
          header: Ext.ux.sfI18n.translations.source,
          dataIndex: 'source'
      },{
          id:'target',
          groupable: false,
          sortable: false,
          hideable: false,
          renderer: function(val){return Ext.util.Format.htmlEncode(val);},
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
               {property : 'is_translated', value: false},
               {property : 'source', value: /[\D]/},
              ]);              
            }else{
              store.filter([
               {property : 'id', value: /\w/},
               {property : 'source', value: /\D/},
              ]);              
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
               {property : 'id', value: /\w/},
               {property : 'source', value: /\D/},
              ]);
            if(store.proxy){
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
              //load records from store
              form.getForm().loadRecord(opts.record);
              //set translation fields from the response
              for(var i=0;i<data.length;i++){
                if(form.findById(data[i].code)){
                  form.findById(data[i].code).setValue(data[i].value);
                }
              }
             }
          });
        }
      },
      store: this.createStore(storeId,url,data)
    };  
  },
    
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
            read    : {url: url, method:'GET'},
            create  : {url: url, method:'POST'},
            update  : {url: url, method:'POST'},
            destroy : {url: url, method:'POST'}
        }    
      });
      config.baseParams = {
        start : 0,
        limit : 50
      };
    }

    return new Ext.data.GroupingStore(config);
  },
  
  createLocalConfig : function(config,data){    
    
    return config;
  },
  
  createRemoteConfig : function(config,url){
    
    return config;
  }
  

});



Ext.onReady(function(){
  Ext.ux.sfI18n.handleTrigger('translation-trigger');
});
