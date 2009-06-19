<?php
/*
 * This file is part of the mgWidgetsPlugin package.
 * (c) 2008 MenuGourmet 
 *
 * Author : Thomas Rabaix <thomas.rabaix@soleoweb.com>
 * 
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class PluginmgI18nTargetsForm extends sfForm
{

  public function configure()
  {

    $this->setWidgets(array(
      'catalogue' => new sfWidgetFormInput,
      'source'    => new sfWidgetFormInput,
      'targets'   => new sfWidgetFormChoiceMany(array(
        'choices' => sfConfig::get('app_mgI18nPlugin_cultures_available')
    ))
    ));

    $this->setValidators(array(
      'catalogue' => new sfValidatorString(array('required' => true)),
      'source'    => new sfValidatorString(array('required' => true)),
      'targets'   => new sfValidatorPass()
    ));


  }

  public function save()
  {
    $cultures = sfConfig::get('app_mgI18nPlugin_cultures_available');

    foreach( $cultures as $code => $name)
    {
      $catalogues[] = $this->getValue('catalogue').'.'.$code;
    }
    
    $tc = Doctrine::getTable('mgI18nCatalogue');
    
    $trans_units = Doctrine::getTable('mgI18nTransUnit')
      ->createQuery('tu')
      ->leftJoin('tu.mgI18nCatalogue tc')
      ->select('*')
      ->whereIn('tc.name', $catalogues)
      ->addWhere('tu.source = ?', $this->getValue('source'))
      ->execute();

    $targets = $this->getValue('targets');
    
    foreach($trans_units as $trans_unit)
    {
      $name_catalogue = $trans_unit->mgI18nCatalogue->name;
      $culture = $trans_unit->mgI18nCatalogue->getLanguage();
      
      $trans_unit->setTarget($targets[$culture]);
      $trans_unit->save();
      
      $tc->clearCache($this->getValue('catalogue').'.'.$culture, $culture);
      
      unset($cultures[$culture]);
    }
    
    foreach($cultures as $code => $name)
    {
      $tc->addMessage($this->getValue('catalogue').'.'.$code, $this->getValue('source'), $targets[$code]);
      $tc->clearCache($this->getValue('catalogue').'.'.$code, $code);
    }
    
  }
}

