<?php


$uuid_generator = \Drupal::getContainer()->get('uuid');

$entity_map = getContentToExport();

foreach ($entity_map as $entity_type_id => $ids) {
  $loader = Drupal::entityTypeManager()->getStorage($entity_type_id);
  foreach (array_chunk($ids, 200) as $chunk) {
    $entities = $loader->loadMultiple($chunk);
    foreach ($entities as $entity) {
      $entity->set('uuid', $uuid_generator->generate());
      $entity->save();
    }
  }
}

function getContentToExport() {
  $entities = [];
  $entity_type_manager = \Drupal::entityTypeManager();
  $excludedTypes = [
    'content_moderation_state',
    'crop',
    'path_alias',
    'site_alert',
    'user_history',
    'user_role',
    'user',
  ];


  $definitions = array_diff_key($entity_type_manager->getDefinitions(), array_flip($excludedTypes));
  foreach ($definitions as $entity_type) {
    if (is_a($entity_type->getClass(), '\Drupal\Core\Entity\ContentEntityInterface', TRUE)) {
      $storage = $entity_type_manager->getStorage($entity_type->id());
      $entities[$entity_type->id()] = $storage->getQuery()->execute();
    }
  }
  return $entities;
}
