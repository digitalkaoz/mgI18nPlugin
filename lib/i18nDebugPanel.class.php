<?php

class i18nDebugPanel extends sfWebDebugPanel
{
  
  public static function listenToLoadDebugWebPanelEvent(sfEvent $event)
  {
    $event->getSubject()->setPanel('i18n',new self($event->getSubject()));
  }

  public function getTitle()
  {
    if(sfConfig::get('sf_i18n',false))
    {
      $context = sfcontext::getInstance();
      $context->getConfiguration()->loadHelpers(array('I18N'));
      $label = __('title_translation', null, 'mgI18nAdmin');
    }
    else
    {
      $label = 'Translations';
    }
    return '<span id="translation-trigger"><img src="/images/default/grid/hmenu-asc.gif" alt="'.$label.'" height="16" width="16" />'.$label.'</span>
      <script type="text/javascript" src="/mgI18nPlugin/js/gui.js" ></script>';
  }
 
  public function getPanelContent(){
    return null;
  }
  
  public function getPanelTitle()
  {    
    return ;    
  }
  
  public function getTitleUrl() {
    return '#';
  }
  
}
