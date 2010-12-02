<script type="text/javascript">
  Ext.ns('Ext.ux.sfI18n');
  
  Ext.ux.sfI18n.urls = {
    current : '<?php echo url_for('@mg_i18n_get_targets') ?>',
    database : '<?php echo url_for('@mg_i18n_get_messages?type=database') ?>',
    file : '<?php echo url_for('@mg_i18n_get_messages?type=ajax_lib_application') ?>',
    update : '<?php echo url_for('@mg_i18n_update') ?>'
  };
  
  Ext.ux.sfI18n.transunits = [
  <?php foreach(sfConfig::get('app_mgI18nPlugin_cultures_available') as $code => $name): ?>
    {code: '<?php echo $code?>', name:'<?php echo $name?>'},
  <?php endforeach; ?>
  ];
  
  Ext.ux.sfI18n.translations = {
    current :'<?php echo __('tabs_translation_current_page', null, 'mgI18nAdmin') ?>',
    files :'<?php echo __('tabs_translation_ajax_lib_application', null, 'mgI18nAdmin') ?>',
    database : '<?php echo __('tabs_translation_db', null, 'mgI18nAdmin') ?>',
    source : '<?php echo __('header_source', null, 'mgI18nAdmin') ?>',
    target : '<?php echo __('header_target', null, 'mgI18nAdmin') ?>',
    filter : '<?php echo __('label_filter_list', null, 'mgI18nAdmin') ?>',
    save : '<?php echo __('btn_save_translation', null, 'mgI18nAdmin') ?>',
    title: '<?php echo __('title_translation', null, 'mgI18nAdmin') ?>',
    translated: '<?php echo __('label_hide_translated_page', null, 'mgI18nAdmin') ?>',
    deleteit : '<?php echo __('Delete') ?>'
  };  
</script>

<?php echo stylesheet_tag($sf_request->getRelativeUrlRoot().'/mgI18nPlugin/css/translations-box.css');?>
