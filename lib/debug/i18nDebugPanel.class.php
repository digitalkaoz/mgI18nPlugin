<?php

class i18nDebugPanel extends sfWebDebugPanel
{
  protected $label;
  
  public static function listenToLoadDebugWebPanelEvent(sfEvent $event)
  {
    if(sfConfig::get('mg_i18n_enabled',false) && !sfContext::getInstance()->getRequest()->isXmlHttpRequest())
    {
      $event->getSubject()->setPanel('i18n',new self($event->getSubject()));
    }
  }

  public function getTitle()
  {
    if(sfConfig::get('sf_i18n',false))
    {
      $context = sfContext::getInstance();
      $context->getConfiguration()->loadHelpers(array('I18N'));
      $this->label = __('title_translation', null, 'mgI18nAdmin');
    }
    else
    {
      $this->label = 'Translations';
    }
    return '<span id="translation-trigger"><img src="/images/default/grid/hmenu-asc.gif" alt="'.$this->label.'" height="16" width="16" />'.$this->label.'</span>';
      
  }
 
  public function getPanelContent()
  {
    return '<script type="text/javascript" src="/mgI18nPlugin/js/gui.js" ></script>
      <link href="/mgI18nPlugin/css/translations-box.css" media="screen" type="text/css" rel="stylesheet">';
  }
  
  public function getPanelTitle()
  {    
    return $this->label;    
  }
  
  public function getTitleUrl() {
    return '#';
  }
  
}
