<?php

namespace Drupal\va_gov_content_export;

use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountSwitcherInterface;
use Drupal\Core\State\StateInterface;
use Drupal\file\FileInterface;
use Drupal\tome_sync\Event\ContentCrudEvent;
use Drupal\tome_sync\Event\TomeSyncEvents;
use Drupal\tome_sync\Exporter;
use Drupal\tome_sync\FileSyncInterface;
use Drupal\tome_sync\TomeSyncHelper;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Serializer\Serializer;

/**
 * Exporter class for Tome.
 *
 * Overridden to exclude more types of entities.
 */
class TomeExporter extends Exporter {

  /**
   * An array of excluded entity types.
   *
   * @var string[]
   */
  protected static $excludedTypes = [
    'content_moderation_state',
    'crop',
    'node.documentation_page',
    'path_alias',
    'site_alert',
    'user_history',
    'user_role',
    'user',
    'menu_link_content',
    'redirect',
    'search_api_task',
    'oauth2_token',
    'webform_submission',
    'entity_subqueue',
    'consumer',
    'entity_embed_fake_entity',
    'file',
    'media',
  ];

  /**
   * State Interface
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * Creates an Exporter object.
   *
   * This was overridden to allow the file system to be injected.
   *
   * @param \Drupal\Core\Config\StorageInterface $content_storage
   *   The target content storage.
   * @param \Symfony\Component\Serializer\Serializer $serializer
   *   The serializer.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Symfony\Component\EventDispatcher\EventDispatcherInterface $event_dispatcher
   *   The event dispatcher.
   * @param \Drupal\Core\Session\AccountSwitcherInterface $account_switcher
   *   The account switcher.
   * @param \Drupal\tome_sync\FileSyncInterface $file_sync
   *   The file sync service.
   * @param \Drupal\va_gov_content_export\AddBreadcrumbToEntity $add_breadcrumb_to_entity
   *   The BreadcrumbEntity Manager.
   * @param \Drupal\va_gov_content_export\ListDataCompiler $list_data_compiler
   *   The list data compiler service.
   */
  public function __construct(
    StorageInterface $content_storage,
    Serializer $serializer,
    EntityTypeManagerInterface $entity_type_manager,
    EventDispatcherInterface $event_dispatcher,
    AccountSwitcherInterface $account_switcher,
    FileSyncInterface $file_sync,
    StateInterface $state
  ) {
    parent::__construct($content_storage, $serializer, $entity_type_manager,
      $event_dispatcher, $account_switcher, $file_sync);

    $this->state = $state;
  }

  /**
   * {@inheritDoc}
   */
  public function exportContent(ContentEntityInterface $entity) {
    $shouldExport = $this->state->get('va_gov.content_export_enable', TRUE);
    if (!$shouldExport) {
      return;
    }

    parent::exportContent($entity);
  }

}
