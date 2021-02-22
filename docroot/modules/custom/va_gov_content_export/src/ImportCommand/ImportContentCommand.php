<?php

namespace Drupal\va_gov_content_export\ImportCommand;

use Drupal\tome_sync\TomeSyncHelper;

class ImportContentCommand {

  /**
   * @var \Drupal\tome_sync\ImporterInterface
   */
  protected $importer;

  /**
   * ImportContentCommand constructor.
   *
   * @param \Drupal\tome_sync\ImporterInterface $importer
   */
  public function __construct(\Drupal\tome_sync\ImporterInterface $importer
  ) {
    $this->importer = $importer;
  }


  public function run(array $names) {

    foreach ($names as $name) {
      [$entity_type_id, $uuid, $langcode] = TomeSyncHelper::getPartsFromContentName($name);
      echo 'importing ' . $entity_type_id . ' ' . $uuid;
      $this->importer->importContent($entity_type_id, $uuid, $langcode);
    }
  }
}
