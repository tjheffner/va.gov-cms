<?php


$uuid_generator = \Drupal::getContainer()->get('uuid');
$state = \Drupal::getContainer()->get('state');

$state->set('va_gov.content_export_enable', FALSE);
echo 'Tome Sync Disabled' . PHP_EOL;

echo 'Gathering content' . PHP_EOL;
$entity_map = \Drupal::getContainer()->get('tome_sync.exporter')->getContentToExport();

foreach ($entity_map as $entity_type_id => $ids) {
  $loader = Drupal::entityTypeManager()->getStorage($entity_type_id);
  echo 'Updating uuid for ' . $entity_type_id . PHP_EOL;
  foreach (array_chunk($ids, 200) as $chunk) {
    echo '.';
    $entities = $loader->loadMultiple($chunk);
    foreach ($entities as $entity) {
      $entity->set('uuid', $uuid_generator->generate());
      $entity->save();
    }
  }
  echo PHP_EOL;
}

$state->set('va_gov.content_export_enable', TRUE);

echo 'Complete';
