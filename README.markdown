mgI18nPlugin
============

Requirements
------------

* symfony 1.3
* Propel or Doctrine
* pdo_mysql (not tested with others databases)
* ExtJs

Installation
------------

 * edit your **factories.yml**

        all:
          # ...
          i18n:
            class: mgI18N
            param:
              source:               mgMySQL
              database:             doctrine  # or propel or any names defined in the databases.yml files
              debug:                false
              learning_mode:        true        # if 'on' all translations are automatically added to the database
              global_application:  'frontend' # Optional ; use the same translations catalogues for all applications
              untranslated_prefix:  "[T]"
              untranslated_suffix:  "[/T]"
              cache:
                class: sfFileCache
                param:
                  automatic_cleaning_factor: 0
                  cache_dir:                 %SF_I18N_CACHE_DIR%
                  lifetime:                  86400
                  prefix:                    %SF_APP_DIR%

 * you can change the default doctrine connection's name by editing your **app.yml** file

        all:
          # ...
          mgI18nPlugin:
            connection: doctrine
            cultures_available: 
              fr: Français
              en: English

   you can use 2 databases : a project database and a translation database. Separating
   databases help you to manage different staging.

 * (optional) edit the **databases.yml** file to add the mg_i18n_plugin connection.

        mg_i18n_plugin:
          class: sfDoctrineDatabase
          param:
            dsn: 'mysql:host=127.0.0.1;dbname=project_database_i18n;charset=utf-8'
            username: username
            password: password

 * install the table

        ./symfony i18n:mg-create-table frontend

 * Install ExtJS

    * update the **view.yml**

            javascripts:
              - ext-all.js

            stylesheets:
              - /js/resources/ext-all.css

 * publish plugin asset
 
        ./symfony plugin:publish-assets

 * install plugin translation for each application

        ./symfony i18n:mg-xliff-import frontend plugins/mgI18nPlugin/i18n/*
        ./symfony i18n:mg-xliff-import backend plugins/mgI18nPlugin/i18n/*

 * add the filter, edit the **filters.yml** (the filter add current page translation messages)

        i18n:
          class: mgI18nFilter

        common:    ~ # before the common filter

 * clear cache

        ./symfony cc

 * click the **Translations Button in your WebDebug Toolbar**


Registering Event
-----------------

In some edge cases, the plugin might not find the translation. The current fallback
is to register to an event, and add the translation into an array.


 * connect to the event

        class ProjectConfiguration extends sfProjectConfiguration
        {
          public function setup()
          {
            $this->enableAllPluginsExcept(array(
             'sfPropelPlugin',
             'sfCompat10Plugin'
            ));

            // [...]
            $this->dispatcher->connect('mgI18nPlugin.assign_ajax_values', array('mgI18nAjaxTranslation', 'listenToEvent'));
          }
        }

 * Create a class `mgI18nAjaxTranslation`

        class mgI18nAjaxTranslation extends mgI18nMessageHelper
        {

          public static function listenToEvent(sfEvent $event, $i18n_messages)
          {

            $messages = array(
              'your-catalogue' => array(
                array('your_message', array('name_param1', 'name_param2'),
              ),
            );

            return self::appendMessages($i18n_messages, $messages);
          }
        }

 * Now these messages will appear on the AJAX tabs


Of course you can connect many different objects to the `mgI18nPlugin.assign_ajax_values`
event, from modules to plugins.


Security
--------

By default the translation panel appears only if the current user is a sfGuard's
super admin. This behavior is controlled by the mgI18nUser class. Copy-and-paste
this class into the project|application lib folder and customize the logic
depends on the specification.

    class mgI18nUser
    {

      /**
       * return true or false if the current user can use the translation tools
       *
       * @param sfContext $context
       * @return boolean
       */
      public static function canTranslate(sfContext $context)
      {
        $sf_user = $context->getUser();

        if($sf_user instanceof sfGuardSecurityUser)
        {

          return $sf_user->isSuperAdmin();
        }

        return false;
      }
    }


Note
----

You can import xliff catalogue with the command : 

        ./symfony i18n:mg-xliff-import frontend PATH_TO_YOUR_CATALOGUES/*|YOUR_CATALOGUE
